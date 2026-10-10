import type { FastifyPluginAsync } from 'fastify';
import { requireAdmin } from '../auth/guard';
import { computeAnalytics } from '../services/analytics';

const routes: FastifyPluginAsync = async (app) => {
  app.get('/admin/analytics', async (req) => computeAnalytics(app.ctx.db, requireAdmin(app.ctx, req).venueId));
};
export default routes;
