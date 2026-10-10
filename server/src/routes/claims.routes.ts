import type { FastifyPluginAsync } from 'fastify';
import { claimAnswersSchema, claimDecisionSchema, pickupLookupSchema, pickupReleaseSchema } from '@vlf/shared';
import { requireStaff } from '../auth/guard';
import { challengesOf, getClaim } from '../repos/claims';
import { getItem } from '../repos/items';
import { requireClaim, submitAnswers } from '../services/claims/submit';
import { compareClaim, decideClaim, listClaims } from '../services/claims/review';
import { lookupPickup, releasePickup } from '../services/claims/pickup';
import { notFound } from '../errors';

const routes: FastifyPluginAsync = async (app) => {
  const ctx = app.ctx;
  const tokenOf = (req: { params: unknown }) => (req.params as { token: string }).token;

  // ---- claimant (token link, no login) ----
  app.get('/public/claims/:token', async (req) => {
    const claim = requireClaim(ctx, tokenOf(req));
    const item = getItem(ctx.db, claim.item_id)!;
    return {
      status: claim.status,
      decisionReason: claim.status === 'denied' ? claim.decision_reason : null,
      item: { categoryLabel: ctx.categories.get(item.category)?.label ?? item.category, color: item.color, area: item.found_area },
      // Questions only. Expected answers are never sent.
      questions: challengesOf(claim).map(({ field, question }) => ({ field, question })),
    };
  });

  app.post('/public/claims/:token/answers', async (req) => {
    submitAnswers(ctx, tokenOf(req), claimAnswersSchema.parse(req.body).answers);
    return { ok: true };
  });

  // ---- staff ----
  app.get('/claims', async (req) => {
    const user = requireStaff(ctx, req);
    return listClaims(ctx, user.venueId, (req.query as { status?: string }).status);
  });

  app.get('/claims/:id', async (req) => {
    const user = requireStaff(ctx, req);
    return compareClaim(ctx, (req.params as { id: string }).id, user.venueId);
  });

  app.post('/claims/:id/decision', async (req) => {
    const user = requireStaff(ctx, req);
    const { decision, reason } = claimDecisionSchema.parse(req.body);
    const id = (req.params as { id: string }).id;
    if (!getClaim(ctx.db, id)) throw notFound('Claim not found');
    decideClaim(ctx, user, id, decision, reason);
    return { ok: true };
  });

  app.post('/pickup/lookup', async (req) => lookupPickup(ctx, requireStaff(ctx, req), pickupLookupSchema.parse(req.body).code));

  app.post('/pickup/release', async (req) => {
    const user = requireStaff(ctx, req);
    releasePickup(ctx, user, pickupReleaseSchema.parse(req.body).code);
    return { ok: true };
  });
};
export default routes;
