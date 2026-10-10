import type { AppContext } from '../../context';
import { AppError, badRequest, notFound } from '../../errors';
import { nowIso } from '../../ids';
import { getItem } from '../../repos/items';
import { challengesOf, getClaimByToken, type ClaimRow } from '../../repos/claims';
import { transitionItem } from '../custody';

export const MAX_ATTEMPTS = 5;
export const ATTEMPT_WINDOW_MS = 60 * 60 * 1000;

/** Rate limit per ITEM (not per token), so filing many reports cannot brute-force one item. */
function consumeAttempt(ctx: AppContext, itemId: string): void {
  const since = new Date(Date.now() - ATTEMPT_WINDOW_MS).toISOString();
  const { n } = ctx.db.prepare('SELECT COUNT(*) AS n FROM claim_attempts WHERE item_id = ? AND at > ?').get(itemId, since) as { n: number };
  if (n >= MAX_ATTEMPTS) throw new AppError(429, 'Too many claim attempts for this item. Please try again later.', 'rate_limited');
  ctx.db.prepare('INSERT INTO claim_attempts (item_id, at) VALUES (?, ?)').run(itemId, nowIso());
}

export function requireClaim(ctx: AppContext, token: string): ClaimRow {
  const claim = getClaimByToken(ctx.db, token);
  if (!claim) throw notFound('Claim link not found');
  return claim;
}

/** Claimant submits answers. Item moves stored -> claim_pending (one active claim per item). */
export function submitAnswers(ctx: AppContext, token: string, answers: Record<string, string>): void {
  const claim = requireClaim(ctx, token);
  if (claim.status !== 'open') throw new AppError(409, 'This claim has already been submitted', 'conflict');
  consumeAttempt(ctx, claim.item_id);

  const missing = challengesOf(claim).filter((c) => !answers[c.field]?.trim());
  if (missing.length) throw badRequest('Please answer every question');

  const item = getItem(ctx.db, claim.item_id);
  if (!item || item.state !== 'stored') {
    throw new AppError(409, 'This item is no longer available to claim', 'conflict');
  }
  ctx.db.transaction(() => {
    ctx.db.prepare(`UPDATE claims SET status = 'submitted', answers_json = ?, submitted_at = ? WHERE id = ?`).run(
      JSON.stringify(answers), nowIso(), claim.id,
    );
    transitionItem(ctx.db, claim.item_id, 'claim_pending', { userId: null, label: `claimant ${claim.claimant_email}` }, 'Claim submitted');
  })();
}
