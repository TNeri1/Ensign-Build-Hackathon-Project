import { scoreAnswer, type AnswerVerdict, type SessionUser } from '@vlf/shared';
import type { AppContext } from '../../context';
import { AppError, notFound } from '../../errors';
import { nowIso } from '../../ids';
import { answersOf, challengesOf, getClaim } from '../../repos/claims';
import { getAttributes, getItem } from '../../repos/items';
import { sendNotification } from '../../notify/outbox';
import { transitionItem } from '../custody';

export interface Comparison {
  field: string;
  question: string;
  expected: string;
  given: string;
  /** match / close / differs (advisory; staff decide). */
  verdict: AnswerVerdict;
  /** verdict === 'match' (kept for older clients). */
  autoMatch: boolean;
}

/** Side-by-side view for staff: claimant answers vs the private record. */
export function compareClaim(ctx: AppContext, claimId: string, venueId: string) {
  const claim = getClaim(ctx.db, claimId);
  const item = claim && getItem(ctx.db, claim.item_id);
  if (!claim || !item || item.venue_id !== venueId) throw notFound('Claim not found');
  const priv = new Map(getAttributes(ctx.db, item.id).map((a) => [a.key, a.value]));
  const answers = answersOf(claim);
  const comparisons: Comparison[] = challengesOf(claim).map((c) => {
    const expected = priv.get(c.field) ?? '';
    const given = answers[c.field] ?? '';
    const { verdict } = scoreAnswer(c.match, expected, given);
    return { field: c.field, question: c.question, expected, given, verdict, autoMatch: verdict === 'match' };
  });
  return {
    claim: { id: claim.id, status: claim.status, claimantEmail: claim.claimant_email, submittedAt: claim.submitted_at, decisionReason: claim.decision_reason },
    item: { id: item.id, category: item.category, color: item.color, foundArea: item.found_area, state: item.state, hasPhoto: !!item.photo_path, sensitive: !!item.sensitive },
    comparisons,
  };
}

export function listClaims(ctx: AppContext, venueId: string, status?: string) {
  const rows = ctx.db
    .prepare(
      `SELECT c.id, c.status, c.claimant_email AS claimantEmail, c.submitted_at AS submittedAt, i.category, i.color, i.id AS itemId
         FROM claims c JOIN items i ON i.id = c.item_id
        WHERE i.venue_id = ? AND c.status != 'open' ${status ? 'AND c.status = ?' : ''}
        ORDER BY c.submitted_at DESC LIMIT 100`,
    )
    .all(...(status ? [venueId, status] : [venueId]));
  return rows;
}

/** Approve (item -> verified) or deny (item -> stored). Only submitted claims can be decided. */
export function decideClaim(ctx: AppContext, user: SessionUser, claimId: string, decision: 'approve' | 'deny', reason: string): void {
  const claim = getClaim(ctx.db, claimId);
  const item = claim && getItem(ctx.db, claim.item_id);
  if (!claim || !item || item.venue_id !== user.venueId) throw notFound('Claim not found');
  if (claim.status !== 'submitted') throw new AppError(409, 'Claim is not awaiting a decision', 'conflict');

  const actor = { userId: user.id, label: `${user.name} (${user.role})` };
  const approve = decision === 'approve';
  ctx.db.transaction(() => {
    ctx.db
      .prepare('UPDATE claims SET status = ?, decision_reason = ?, decided_by = ?, decided_at = ? WHERE id = ?')
      .run(approve ? 'approved' : 'denied', reason, user.id, nowIso(), claim.id);
    transitionItem(ctx.db, item.id, approve ? 'verified' : 'stored', actor, approve ? `Claim approved${reason ? `: ${reason}` : ''}` : `Claim denied: ${reason}`);
  })();

  sendNotification(ctx.db, {
    channel: 'email',
    to: claim.claimant_email,
    subject: approve ? 'Your claim was approved' : 'Your claim could not be verified',
    body: approve
      ? `Your claim was approved. Open your claim link to show your pickup QR code, and bring photo ID to the lost & found desk.`
      : `We could not verify your claim: ${reason}\nIf you think this is a mistake, please visit the lost & found desk.`,
  });
}
