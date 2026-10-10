import { parsePickupCode, type SessionUser } from '@vlf/shared';
import type { AppContext } from '../../context';
import { AppError, notFound } from '../../errors';
import { nowIso } from '../../ids';
import { getClaimByToken } from '../../repos/claims';
import { getItem } from '../../repos/items';
import { transitionItem } from '../custody';

/**
 * The pickup QR encodes the claim token (`vlf:pickup:<token>`). It only works while the claim is
 * 'approved', and is burned on release, so it is single-use.
 */
function findApproved(ctx: AppContext, code: string, venueId: string) {
  const claim = getClaimByToken(ctx.db, parsePickupCode(code));
  const item = claim && getItem(ctx.db, claim.item_id);
  if (!claim || !item || item.venue_id !== venueId) throw notFound('Unknown pickup code');
  if (claim.status === 'released') throw new AppError(409, 'This pickup code was already used', 'already_used');
  if (claim.status !== 'approved') throw new AppError(409, 'This claim is not approved for pickup', 'not_approved');
  return { claim, item };
}

export function lookupPickup(ctx: AppContext, user: SessionUser, code: string) {
  const { claim, item } = findApproved(ctx, code, user.venueId);
  return { claimId: claim.id, claimantEmail: claim.claimant_email, item: { id: item.id, category: item.category, color: item.color, foundArea: item.found_area } };
}

export function releasePickup(ctx: AppContext, user: SessionUser, code: string): void {
  const { claim, item } = findApproved(ctx, code, user.venueId);
  ctx.db.transaction(() => {
    ctx.db.prepare(`UPDATE claims SET status = 'released', decided_at = COALESCE(decided_at, ?) WHERE id = ?`).run(nowIso(), claim.id);
    transitionItem(ctx.db, item.id, 'released', { userId: user.id, label: `${user.name} (${user.role})` }, `Released to ${claim.claimant_email}; photo ID checked`);
  })();
}
