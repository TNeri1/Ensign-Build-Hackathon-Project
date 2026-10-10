import type { FastifyPluginAsync } from 'fastify';
import { intakeSchema, isItemState } from '@vlf/shared';
import { requireStaff } from '../auth/guard';
import { badRequest, notFound } from '../errors';
import { createItem } from '../services/intake';
import { readPhoto } from '../services/photos';
import { listCustody } from '../services/custody';
import { getAttributes, getItem } from '../repos/items';
import { titleOf } from '../services/itemTitle';

const routes: FastifyPluginAsync = async (app) => {
  const ctx = app.ctx;

  /** Multipart: `data` = JSON (intakeSchema), optional `photo` file. */
  app.post('/items', async (req) => {
    const user = requireStaff(ctx, req);
    let json: unknown;
    let photo: { data: Buffer; mimetype: string } | undefined;
    for await (const part of req.parts()) {
      if (part.type === 'file') photo = { data: await part.toBuffer(), mimetype: part.mimetype };
      else if (part.fieldname === 'data') {
        try { json = JSON.parse(String(part.value)); } catch { throw badRequest('data must be JSON'); }
      }
    }
    const input = intakeSchema.parse(json);
    const id = createItem(ctx, user, input, photo);
    return { id };
  });

  app.get('/items', async (req) => {
    const user = requireStaff(ctx, req);
    const q = req.query as { state?: string; binId?: string };
    const where = ['i.venue_id = ?'];
    const args: unknown[] = [user.venueId];
    if (q.state) {
      if (!isItemState(q.state)) throw badRequest('Unknown state');
      where.push('i.state = ?');
      args.push(q.state);
    }
    if (q.binId) { where.push('i.bin_id = ?'); args.push(q.binId); }
    return ctx.db
      .prepare(
        `SELECT i.id, i.category, i.name, i.color, i.found_area AS foundArea, i.found_at AS foundAt, i.state,
                i.sensitive, i.photo_path IS NOT NULL AS hasPhoto, b.code AS binCode
           FROM items i LEFT JOIN storage_bins b ON b.id = i.bin_id
          WHERE ${where.join(' AND ')} ORDER BY i.created_at DESC LIMIT 200`,
      )
      .all(...args)
      .map((r) => ({ ...(r as { id: string; name: string | null; category: string }), title: titleOf(ctx, r as never) }));
  });

  app.get('/items/:id', async (req) => {
    const user = requireStaff(ctx, req);
    const item = getItem(ctx.db, (req.params as { id: string }).id);
    if (!item || item.venue_id !== user.venueId) throw notFound('Item not found');
    return {
      ...item,
      title: titleOf(ctx, item),
      attributes: getAttributes(ctx.db, item.id),
      custody: listCustody(ctx.db, item.id),
    };
  });

  app.get('/items/:id/photo', async (req, reply) => {
    const user = requireStaff(ctx, req);
    const item = getItem(ctx.db, (req.params as { id: string }).id);
    if (!item || item.venue_id !== user.venueId || !item.photo_path) throw notFound('No photo');
    const photo = readPhoto(ctx.config.photoDir, item.photo_path);
    if (!photo) throw notFound('No photo');
    return reply.header('Cache-Control', item.sensitive ? 'no-store' : 'private, max-age=300').type(photo.mimetype).send(photo.data);
  });
};
export default routes;
