import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { defaultVenueId } from '../repos/venues';
import { notFound } from '../errors';
import { getPublicItem, searchPublicItems } from '../services/publicItems';

const searchSchema = z.object({
  category: z.string().optional(),
  color: z.string().optional(),
  area: z.string().max(80).optional(),
  q: z.string().max(80).optional(),
});

/** Everything under /api/public is unauthenticated and redacted. See test/publicLeak.test.ts. */
const routes: FastifyPluginAsync = async (app) => {
  const { db, categories } = app.ctx;

  app.get('/public/categories', async () => categories.all().map((c) => ({ id: c.id, label: c.label })));

  app.get('/public/items', async (req) => {
    const venue = defaultVenueId(db);
    if (!venue) return [];
    return searchPublicItems(db, venue, categories, searchSchema.parse(req.query));
  });

  app.get('/public/items/:id', async (req) => {
    const venue = defaultVenueId(db);
    const item = venue && getPublicItem(db, venue, categories, (req.params as { id: string }).id);
    if (!item) throw notFound('Item not found');
    return item;
  });
};
export default routes;
