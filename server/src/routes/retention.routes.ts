import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAdmin, requireStaff } from '../auth/guard';
import { disposeBatch, listFlagged, runRetentionJob } from '../services/retention';

const disposeSchema = z.object({ itemIds: z.array(z.string()).min(1).max(200), note: z.string().max(200).optional() });

const routes: FastifyPluginAsync = async (app) => {
  const ctx = app.ctx;
  app.get('/retention/flagged', async (req) => listFlagged(ctx, requireStaff(ctx, req).venueId));
  app.post('/retention/run', async (req) => { requireStaff(ctx, req); return { flagged: runRetentionJob(ctx) }; });
  app.post('/retention/dispose', async (req) => {
    const user = requireAdmin(ctx, req);
    const { itemIds, note } = disposeSchema.parse(req.body);
    return { disposed: disposeBatch(ctx, user, itemIds, note) };
  });
};
export default routes;
