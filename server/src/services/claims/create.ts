import { buildChallenges, type Challenge } from '@vlf/shared';
import type { AppContext } from '../../context';
import { hashToken, newId, newToken, nowIso } from '../../ids';
import { getAttributes, getItem } from '../../repos/items';

/**
 * Create an open claim for an item and return the claim token (only ever shown in the notification).
 * Only questions are stored, never expected answers; those are read from the item at check time.
 */
export function createClaim(
  ctx: AppContext,
  itemId: string,
  claimantEmail: string,
  reportId: string | null,
): { claimId: string; token: string } | null {
  const item = getItem(ctx.db, itemId);
  const def = item && ctx.categories.get(item.category);
  if (!item || !def) return null;
  const priv = Object.fromEntries(getAttributes(ctx.db, itemId).filter((a) => !a.is_public).map((a) => [a.key, a.value]));
  const challenges: Challenge[] = buildChallenges(def, priv);
  if (challenges.length === 0) return null;

  const claimId = newId();
  const token = newToken();
  ctx.db
    .prepare(
      `INSERT INTO claims (id, item_id, report_id, token_hash, claimant_email, status, challenges_json, created_at)
       VALUES (?, ?, ?, ?, ?, 'open', ?, ?)`,
    )
    .run(claimId, itemId, reportId, hashToken(token), claimantEmail.toLowerCase(), JSON.stringify(challenges), nowIso());
  return { claimId, token };
}
