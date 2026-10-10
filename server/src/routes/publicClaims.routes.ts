import type { FastifyPluginAsync } from 'fastify';
import { startClaimSchema } from '@vlf/shared';
import { startClaimFromListing } from '../services/claims/start';

/** Public: start a claim on a listed item. Returns only the claim token (the questions come from GET /public/claims/:token). */
const routes: FastifyPluginAsync = async (app) => {
  app.post('/public/items/:id/claims', async (req) => {
    const { contactEmail } = startClaimSchema.parse(req.body);
    return { token: startClaimFromListing(app.ctx, (req.params as { id: string }).id, contactEmail) };
  });
};
export default routes;
