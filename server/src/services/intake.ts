import { resolveAttributes, type IntakeInput, type SessionUser } from '@vlf/shared';
import type { AppContext } from '../context';
import { badRequest } from '../errors';
import { newId, nowIso } from '../ids';
import { insertAttributes, insertItem } from '../repos/items';
import { recordCreation, transitionItem } from './custody';
import { savePhoto } from './photos';

export interface PhotoUpload {
  data: Buffer;
  mimetype: string;
}

/** Create an item from a staff intake form. Returns the new item id. */
export function createItem(ctx: AppContext, user: SessionUser, input: IntakeInput, photo?: PhotoUpload): string {
  const def = ctx.categories.get(input.category);
  if (!def) throw badRequest(`Unknown category: ${input.category}`);
  const { attributes, errors } = resolveAttributes(def, input.fields);
  if (errors.length) throw badRequest(errors.join('; '));

  if (input.binId) {
    const bin = ctx.db.prepare('SELECT id FROM storage_bins WHERE id = ? AND venue_id = ?').get(input.binId, user.venueId);
    if (!bin) throw badRequest('Unknown storage bin');
  }

  const id = newId();
  const now = nowIso();
  const photoPath = photo ? savePhoto(ctx.config.photoDir, id, photo.data, photo.mimetype) : null;
  const actor = { userId: user.id, label: `${user.name} (${user.role})` };

  ctx.db.transaction(() => {
    insertItem(ctx.db, {
      id, venue_id: user.venueId, category: def.id, color: input.color, found_area: input.foundArea,
      found_at: input.foundAt ?? now, state: 'found', bin_id: null, photo_path: photoPath,
      sensitive: def.sensitive ? 1 : 0, created_by: user.id, created_at: now, updated_at: now,
    });
    insertAttributes(ctx.db, id, attributes);
    recordCreation(ctx.db, id, 'found', actor, 'Logged at intake');
    if (input.binId) transitionItem(ctx.db, id, 'stored', actor, 'Placed in bin at intake', { binId: input.binId });
  })();
  return id;
}
