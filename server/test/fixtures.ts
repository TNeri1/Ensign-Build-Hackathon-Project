import type { Db } from '../src/db/connection';
import { newId, nowIso } from '../src/ids';
import { insertItem, insertAttributes, type ItemRow } from '../src/repos/items';
import { recordCreation } from '../src/services/custody';

export function makeVenue(db: Db): string {
  const id = newId();
  db.prepare('INSERT INTO venues (id, name, created_at) VALUES (?, ?, ?)').run(id, 'Test Venue', nowIso());
  return id;
}

export function makeBin(db: Db, venueId: string, code = 'A1'): string {
  const id = newId();
  db.prepare('INSERT INTO storage_bins (id, venue_id, code, label) VALUES (?, ?, ?, ?)').run(id, venueId, code, `Bin ${code}`);
  return id;
}

export function makeItem(db: Db, venueId: string, over: Partial<ItemRow> = {}, attrs: { key: string; value: string; isPublic: boolean }[] = []): string {
  const id = newId();
  const now = nowIso();
  insertItem(db, {
    id, venue_id: venueId, category: 'phone', color: 'black', found_area: 'Main Hall', found_at: now,
    state: 'found', bin_id: null, photo_path: null, sensitive: 0, created_by: null, created_at: now, updated_at: now,
    ...over,
  });
  insertAttributes(db, id, attrs);
  recordCreation(db, id, over.state ?? 'found', { userId: null, label: 'test' });
  return id;
}
