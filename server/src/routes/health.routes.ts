import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({ ok: true }));
};
export default routes;
