import type { AppContext } from '../../context';
import { AppError, notFound } from '../../errors';
import { getItem } from '../../repos/items';
import { defaultVenueId } from '../../repos/venues';
import { sendNotification } from '../../notify/outbox';
import { createClaim } from './create';

/** Claim links that can be opened per item per hour from the listing (stops Outbox spam; answers are limited separately). */
export const MAX_LISTING_CLAIMS_PER_HOUR = 10;

/**
 * A visitor taps an item in the public listing and says "this is mine".
 * Creates an open claim (no lost report) and returns its token so the UI can show the questions at once.
 * The link is also emailed (Outbox) so the visitor can come back later.
 */
export function startClaimFromListing(ctx: AppContext, itemId: string, contactEmail: string): string {
  const item = getItem(ctx.db, itemId);
  if (!item || item.venue_id !== defaultVenueId(ctx.db) || !['found', 'stored'].includes(item.state)) {
    throw notFound('Item not found');
  }
  if (item.state !== 'stored') {
    throw new AppError(409, 'This item is still being logged by staff. File a lost report and we will email you when it can be claimed.', 'not_claimable');
  }
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { n } = ctx.db.prepare('SELECT COUNT(*) AS n FROM claims WHERE item_id = ? AND created_at > ?').get(itemId, since) as { n: number };
  if (n >= MAX_LISTING_CLAIMS_PER_HOUR) throw new AppError(429, 'Too many claims for this item. Please try again later.', 'rate_limited');

  const claim = createClaim(ctx, itemId, contactEmail, null);
  if (!claim) throw new AppError(409, 'This item cannot be verified online. Please visit the lost & found desk.', 'not_claimable');

  const label = ctx.categories.get(item.category)?.label ?? item.category;
  sendNotification(ctx.db, {
    channel: 'email',
    to: contactEmail.toLowerCase(),
    subject: `Your claim for a ${label.toLowerCase()}`,
    body:
      `You started a claim for a ${item.color} ${label.toLowerCase()} found near ${item.found_area}.\n\n` +
      `Answer the verification questions here (you can come back to this link):\n${ctx.config.publicUrl}/claim/${claim.token}\n\n` +
      `If you did not start this claim, you can ignore this message.`,
  });
  return claim.token;
}
