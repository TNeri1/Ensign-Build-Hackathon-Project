import type { FastifyPluginAsync } from 'fastify';
import type { VisionStatus } from '@vlf/shared';
import { requireStaff } from '../auth/guard';
import { badRequest } from '../errors';
import { describePhoto } from '../services/vision/describe';
import { visionEnabled, visionReachable } from '../services/vision/client';

/** Staff-only: pre-fill intake from a photo with a LOCAL vision model (see config.visionUrl). */
const routes: FastifyPluginAsync = async (app) => {
  const ctx = app.ctx;

  app.get('/vision/status', async (req): Promise<VisionStatus> => {
    requireStaff(ctx, req);
    return { enabled: visionEnabled(ctx.config), reachable: await visionReachable(ctx.config), model: ctx.config.visionModel };
  });

  /** Multipart with one `photo` file. Returns { suggestion }. Nothing is stored. */
  app.post('/vision/describe', async (req) => {
    requireStaff(ctx, req);
    const file = await req.file();
    if (!file) throw badRequest('Attach a photo');
    const suggestion = await describePhoto(ctx, await file.toBuffer(), file.mimetype);
    return { suggestion };
  });
};
export default routes;
