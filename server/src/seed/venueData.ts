import type { Db } from '../db/connection';
import { hashPassword } from '../auth/password';
import { newId, nowIso } from '../ids';

export const DEMO_PASSWORD = 'demo1234';
export const STAFF_EMAIL = 'staff@venue.test';
export const ADMIN_EMAIL = 'admin@venue.test';

const BINS: [string, string][] = [
  ['A1', 'Front desk shelf'],
  ['A2', 'Front desk drawer'],
  ['B1', 'Back office rack'],
  ['S1', 'Secure cabinet (IDs, wallets)'],
];

export function seedVenue(db: Db) {
  const venueId = newId();
  db.prepare('INSERT INTO venues (id, name, created_at) VALUES (?, ?, ?)').run(venueId, 'Riverside Arena', nowIso());

  const insertUser = db.prepare(
    'INSERT INTO users (id, venue_id, email, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const staffId = newId();
  const adminId = newId();
  insertUser.run(staffId, venueId, STAFF_EMAIL, 'Sam Rivera', 'staff', hashPassword(DEMO_PASSWORD), nowIso());
  insertUser.run(adminId, venueId, ADMIN_EMAIL, 'Alex Chen', 'admin', hashPassword(DEMO_PASSWORD), nowIso());

  const bins: Record<string, string> = {};
  for (const [code, label] of BINS) {
    const id = newId();
    db.prepare('INSERT INTO storage_bins (id, venue_id, code, label) VALUES (?, ?, ?, ?)').run(id, venueId, code, label);
    bins[code] = id;
  }
  return { venueId, staffId, adminId, bins };
}
