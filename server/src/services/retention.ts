import type { SessionUser } from '@vlf/shared';
import type { AppContext } from '../context';
import { badRequest } from '../errors';
import { transitionItem } from './custody';
import { titleOf } from './itemTitle';

const DAY = 86_400_000;

interface Row { id: string; category: string; found_at: string; sensitive: number; disposal_flagged_at: string | null }

/** Items still on our shelves (found/stored) past their category's retentionDays. Claims in progress are exempt. */
export function findOverdue(ctx: AppContext, now: Date = new Date()): (Row & { daysOverdue: number })[] {
  const rows = ctx.db
    .prepare(`SELECT id, category, found_at, sensitive, disposal_flagged_at FROM items WHERE state IN ('found','stored')`)
    .all() as Row[];
  const out: (Row & { daysOverdue: number })[] = [];
  for (const r of rows) {
    const days = ctx.categories.get(r.category)?.retentionDays;
    if (!days) continue;
    const overdue = Math.floor((now.getTime() - Date.parse(r.found_at)) / DAY) - days;
    if (overdue >= 0) out.push({ ...r, daysOverdue: overdue });
  }
  return out;
}

/** Flag newly overdue items. Idempotent. Returns the number newly flagged. */
export function runRetentionJob(ctx: AppContext, now: Date = new Date()): number {
  const stmt = ctx.db.prepare('UPDATE items SET disposal_flagged_at = ? WHERE id = ? AND disposal_flagged_at IS NULL');
  let n = 0;
  for (const r of findOverdue(ctx, now)) if (stmt.run(now.toISOString(), r.id).changes) n++;
  return n;
}

export function listFlagged(ctx: AppContext, venueId: string, now: Date = new Date()) {
  const overdue = new Map(findOverdue(ctx, now).map((r) => [r.id, r.daysOverdue]));
  const rows = ctx.db
    .prepare(
      `SELECT id, category, name, color, found_area AS foundArea, found_at AS foundAt, sensitive, state, disposal_flagged_at AS flaggedAt
         FROM items WHERE venue_id = ? AND disposal_flagged_at IS NOT NULL AND state IN ('found','stored') ORDER BY found_at`,
    )
    .all(venueId) as { id: string; category: string; name: string | null }[];
  return rows.map((r) => ({ ...r, title: titleOf(ctx, r), categoryLabel: ctx.categories.get(r.category)?.label ?? r.category, daysOverdue: overdue.get(r.id) ?? 0 }));
}

/** Dispose flagged items in one transaction; each gets its own custody event. All-or-nothing. */
export function disposeBatch(ctx: AppContext, user: SessionUser, itemIds: string[], note = 'Retention period expired'): number {
  if (itemIds.length === 0) throw badRequest('No items selected');
  const flagged = ctx.db.prepare('SELECT 1 FROM items WHERE id = ? AND venue_id = ? AND disposal_flagged_at IS NOT NULL');
  ctx.db.transaction(() => {
    for (const id of itemIds) {
      if (!flagged.get(id, user.venueId)) throw badRequest(`Item ${id} is not flagged for disposal`);
      transitionItem(ctx.db, id, 'disposed', { userId: user.id, label: `${user.name} (${user.role})` }, `Disposed: ${note}`);
    }
  })();
  return itemIds.length;
}

export const startRetentionTimer = (ctx: AppContext, everyMs = 3_600_000) => {
  const run = () => { try { runRetentionJob(ctx); } catch (e) { console.error('retention job failed', e); } };
  run();
  return setInterval(run, everyMs).unref();
};
