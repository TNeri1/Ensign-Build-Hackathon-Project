import type { AppContext } from '../../context';
import { getItem, type ItemRow } from '../../repos/items';
import { getReport, listReports, type ReportRow } from '../../repos/reports';
import { sendNotification } from '../../notify/outbox';
import { createClaim } from '../claims/create';
import { defaultMatchConfig, scoreMatch } from './score';

const config = (ctx: AppContext) => defaultMatchConfig(ctx.config.matchThreshold);

/** Run when a new item is logged. Notifies every report that scores above the threshold. */
export function runMatchingForItem(ctx: AppContext, itemId: string): number {
  const item = getItem(ctx.db, itemId);
  if (!item || !['found', 'stored'].includes(item.state)) return 0;
  let sent = 0;
  for (const report of listReports(ctx.db, item.venue_id)) {
    if (tryMatch(ctx, report, item)) sent++;
  }
  return sent;
}

/** Run when a new lost report is filed. Checks every item still in our hands. */
export function runMatchingForReport(ctx: AppContext, reportId: string): number {
  const report = getReport(ctx.db, reportId);
  if (!report) return 0;
  const items = ctx.db
    .prepare(`SELECT * FROM items WHERE venue_id = ? AND state IN ('found','stored')`)
    .all(report.venue_id) as ItemRow[];
  let sent = 0;
  for (const item of items) if (tryMatch(ctx, report, item)) sent++;
  return sent;
}

function tryMatch(ctx: AppContext, report: ReportRow, item: ItemRow): boolean {
  const result = scoreMatch(report, item, config(ctx));
  if (!result.isMatch) return false;
  const exists = ctx.db.prepare('SELECT 1 FROM claims WHERE report_id = ? AND item_id = ?').get(report.id, item.id);
  if (exists) return false; // already notified
  const claim = createClaim(ctx, item.id, report.contact_email, report.id);
  if (!claim) return false;
  const link = `${ctx.config.publicUrl}/claim/${claim.token}`;
  sendNotification(ctx.db, {
    channel: 'email',
    to: report.contact_email,
    subject: `We may have found your ${item.category}`,
    body:
      `Hello,\n\nAn item matching your lost report (${item.category}, ${item.color}, found near ${item.found_area}) ` +
      `was just logged (match score ${result.score}/100).\n\nTo claim it, answer a few verification questions here:\n${link}\n\n` +
      `If this is not yours, you can ignore this message.`,
  });
  return true;
}
