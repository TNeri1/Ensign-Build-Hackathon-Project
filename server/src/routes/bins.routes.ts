import type { FastifyPluginAsync } from 'fastify';
import { binCreateSchema } from '@vlf/shared';
import { requireStaff } from '../auth/guard';
import { AppError } from '../errors';
import { newId } from '../ids';

const routes: FastifyPluginAsync = async (app) => {
  const ctx = app.ctx;

  app.get('/bins', async (req) => {
    const user = requireStaff(ctx, req);
    return ctx.db
      .prepare(
        `SELECT b.id, b.code, b.label,
                (SELECT COUNT(*) FROM items i WHERE i.bin_id = b.id AND i.state IN ('stored','claim_pending','verified')) AS item_count
           FROM storage_bins b WHERE b.venue_id = ? ORDER BY b.code`,
      )
      .all(user.venueId);
  });

  app.post('/bins', async (req) => {
    const user = requireStaff(ctx, req);
    const input = binCreateSchema.parse(req.body);
    const id = newId();
    try {
      ctx.db.prepare('INSERT INTO storage_bins (id, venue_id, code, label) VALUES (?, ?, ?, ?)').run(id, user.venueId, input.code, input.label);
    } catch {
      throw new AppError(409, `Bin code ${input.code} already exists`, 'conflict');
    }
    return { id, ...input };
  });
};
export default routes;
