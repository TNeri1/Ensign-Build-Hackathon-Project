import { buildChallenges, type ItemState } from '@vlf/shared';
import type { AppContext } from '../context';
import { hashToken, newId, newToken } from '../ids';
import { insertAttributes, insertItem } from '../repos/items';
import { recordCreation, transitionItem } from '../services/custody';
import { resolveAttributes } from '@vlf/shared';
import { savePhoto } from '../services/photos';
import { COLOR_RGB, solidPng } from './png';
import type { ItemSpec } from './itemData';

const HOUR = 3_600_000;

export interface SeedActors {
  venueId: string;
  staffId: string;
  bins: Record<string, string>;
}

/** Paths an item can take after being found. */
export const PATHS: Record<string, ItemState[]> = {
  found: [],
  stored: ['stored'],
  released: ['stored', 'claim_pending', 'verified', 'released'],
  disposed: ['stored', 'disposed'],
};

/**
 * Insert an item, replay its lifecycle through the real state machine, then backdate
 * all timestamps so analytics have realistic spans. Returns the item id.
 */
export function seedItem(ctx: AppContext, who: SeedActors, spec: ItemSpec, daysAgo: number, path: keyof typeof PATHS, binCode: string, withPhoto = true): string {
  const def = ctx.categories.get(spec.category)!;
  const { attributes } = resolveAttributes(def, spec.fields);
  const id = newId();
  const foundAt = new Date(Date.now() - daysAgo * 24 * HOUR);
  const photo = withPhoto ? savePhoto(ctx.config.photoDir, id, solidPng(COLOR_RGB[spec.color] ?? [128, 128, 128]), 'image/png') : null;
  const iso = foundAt.toISOString();
  const actor = { userId: who.staffId, label: 'Sam Rivera (staff)' };

  insertItem(ctx.db, {
    id, venue_id: who.venueId, category: spec.category, color: spec.color, found_area: spec.area, found_at: iso,
    state: 'found', bin_id: null, photo_path: photo, sensitive: def.sensitive ? 1 : 0, created_by: who.staffId, created_at: iso, updated_at: iso,
  });
  insertAttributes(ctx.db, id, attributes);
  recordCreation(ctx.db, id, 'found', actor, 'Logged at intake');
  for (const to of PATHS[path]) {
    transitionItem(ctx.db, id, to, actor, to === 'stored' ? 'Placed in bin' : '', to === 'stored' ? { binId: who.bins[binCode] } : {});
  }
  if (path === 'released') insertReleasedClaim(ctx, id, spec);
  backdate(ctx, id, foundAt, path === 'released' ? 5 * HOUR : 2 * HOUR);
  return id;
}

function insertReleasedClaim(ctx: AppContext, itemId: string, spec: ItemSpec) {
  const def = ctx.categories.get(spec.category)!;
  ctx.db
    .prepare(`INSERT INTO claims (id, item_id, token_hash, claimant_email, status, challenges_json, created_at) VALUES (?, ?, ?, ?, 'released', ?, ?)`)
    .run(newId(), itemId, hashToken(newToken()), 'past.owner@example.com', JSON.stringify(buildChallenges(def, spec.fields)), new Date().toISOString());
}

/** Spread custody events after foundAt, `gapMs` apart (so time-to-return is realistic). */
function backdate(ctx: AppContext, itemId: string, foundAt: Date, gapMs: number) {
  const events = ctx.db.prepare('SELECT id FROM custody_events WHERE item_id = ? ORDER BY id').all(itemId) as { id: number }[];
  const upd = ctx.db.prepare('UPDATE custody_events SET at = ? WHERE id = ?');
  events.forEach((e, i) => upd.run(new Date(foundAt.getTime() + (i + 1) * gapMs).toISOString(), e.id));
  const last = new Date(foundAt.getTime() + events.length * gapMs).toISOString();
  ctx.db.prepare('UPDATE items SET updated_at = ? WHERE id = ?').run(last, itemId);
}
