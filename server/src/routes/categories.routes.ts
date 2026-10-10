import type { FastifyPluginAsync } from 'fastify';

/** Category definitions for the web UI (form fields, labels). Challenge templates stay server-side. */
const routes: FastifyPluginAsync = async (app) => {
  app.get('/categories', async () =>
    app.ctx.categories.all().map(({ id, label, sensitive, nameRequired, fields }) => ({ id, label, sensitive, nameRequired, fields })),
  );
};
export default routes;
