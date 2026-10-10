import type { FastifyPluginAsync } from 'fastify';
import { listNotifications } from '../notify/outbox';

/** Dev outbox. Unauthenticated on purpose so the demo works on any device; contains claim links. */
const routes: FastifyPluginAsync = async (app) => {
  app.get('/outbox', async () => listNotifications(app.ctx.db));
};
export default routes;
