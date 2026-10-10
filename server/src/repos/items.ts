import type { Db } from '../db/connection';
import type { ItemState } from '@vlf/shared';

export interface ItemRow {
  id: string;
  venue_id: string;
  category: string;
  color: string;
  found_area: string;
  found_at: string;
  state: ItemState;
  bin_id: string | null;
  photo_path: string | null;
  sensitive: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttributeRow {
  key: string;
  value: string;
  is_public: number;
}

export function getItem(db: Db, id: string): ItemRow | undefined {
  return db.prepare('SELECT * FROM items WHERE id = ?').get(id) as ItemRow | undefined;
}

export function getAttributes(db: Db, itemId: string): AttributeRow[] {
  return db
    .prepare('SELECT key, value, is_public FROM item_attributes WHERE item_id = ? ORDER BY id')
    .all(itemId) as AttributeRow[];
}

export function insertItem(db: Db, row: ItemRow): void {
  db.prepare(
    `INSERT INTO items (id, venue_id, category, color, found_area, found_at, state, bin_id, photo_path,
       sensitive, created_by, created_at, updated_at)
     VALUES (@id, @venue_id, @category, @color, @found_area, @found_at, @state, @bin_id, @photo_path,
       @sensitive, @created_by, @created_at, @updated_at)`,
  ).run(row);
}

export function insertAttributes(db: Db, itemId: string, attrs: { key: string; value: string; isPublic: boolean }[]) {
  const stmt = db.prepare('INSERT INTO item_attributes (item_id, key, value, is_public) VALUES (?, ?, ?, ?)');
  for (const a of attrs) stmt.run(itemId, a.key, a.value, a.isPublic ? 1 : 0);
}
