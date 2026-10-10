import type { CategoryRegistry } from '@vlf/shared';
import type { Db } from '../db/connection';

/** What the public may see. Built field by field; never spread a DB row into this. */
export interface PublicItem {
  id: string;
  category: string;
  categoryLabel: string;
  color: string;
  area: string;
  foundDate: string;
  /** The item's own name when its category records one (e.g. "AirPods case" for 'other'), else null. */
  name: string | null;
  details: { label: string; value: string }[];
  /** True when a visitor can start a claim from the listing (item is shelved: state 'stored'). */
  claimable: boolean;
}

interface Row {
  id: string;
  category: string;
  color: string;
  found_area: string;
  found_at: string;
  state: string;
}

export interface PublicSearchParams {
  category?: string;
  color?: string;
  area?: string;
  q?: string;
}

/** Items still in our hands: found or stored. Claimed/released/disposed items are not listed. */
const LISTED = `('found','stored')`;

export function searchPublicItems(db: Db, venueId: string, reg: CategoryRegistry, p: PublicSearchParams): PublicItem[] {
  const where = [`venue_id = ?`, `state IN ${LISTED}`];
  const args: unknown[] = [venueId];
  if (p.category) { where.push('category = ?'); args.push(p.category); }
  if (p.color) { where.push('color = ?'); args.push(p.color); }
  if (p.area) { where.push('found_area LIKE ?'); args.push(`%${p.area}%`); }
  if (p.q) {
    where.push(`id IN (SELECT item_id FROM item_attributes WHERE is_public = 1 AND value LIKE ?)`);
    args.push(`%${p.q}%`);
  }
  const rows = db
    .prepare(`SELECT id, category, color, found_area, found_at, state FROM items WHERE ${where.join(' AND ')} ORDER BY found_at DESC LIMIT 50`)
    .all(...args) as Row[];
  return rows.map((r) => toPublicItem(db, reg, r));
}

export function getPublicItem(db: Db, venueId: string, reg: CategoryRegistry, id: string): PublicItem | null {
  const row = db
    .prepare(`SELECT id, category, color, found_area, found_at, state FROM items WHERE id = ? AND venue_id = ? AND state IN ${LISTED}`)
    .get(id, venueId) as Row | undefined;
  return row ? toPublicItem(db, reg, row) : null;
}

/** Public field that names the item itself (the 'other' category's "Item name"). Shown as the card title, not a detail. */
const NAME_FIELD = 'item_type';

export function toPublicItem(db: Db, reg: CategoryRegistry, r: Row): PublicItem {
  const def = reg.get(r.category);
  const labels = new Map(def?.fields.map((f) => [f.name, f.label]));
  const attrs = db
    .prepare('SELECT key, value FROM item_attributes WHERE item_id = ? AND is_public = 1 ORDER BY id')
    .all(r.id) as { key: string; value: string }[];
  return {
    id: r.id,
    category: r.category,
    categoryLabel: def?.label ?? r.category,
    color: r.color,
    area: r.found_area,
    foundDate: r.found_at.slice(0, 10),
    name: attrs.find((a) => a.key === NAME_FIELD)?.value ?? null,
    details: attrs.filter((a) => a.key !== NAME_FIELD).map((a) => ({ label: labels.get(a.key) ?? a.key, value: a.value })),
    claimable: r.state === 'stored',
  };
}
