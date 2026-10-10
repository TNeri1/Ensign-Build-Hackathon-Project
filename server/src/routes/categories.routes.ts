import type { FastifyPluginAsync } from 'fastify';

/** Category definitions for the web UI (form fields, labels). Challenge templates stay server-side. */
const routes: FastifyPluginAsync = async (app) => {
  app.get('/categories', async () =>
    app.ctx.categories.all().map(({ id, label, sensitive, fields }) => ({ id, label, sensitive, fields })),
  );
};
export default routes;
