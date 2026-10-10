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
    id, venue_id: venueId, category: 'phone', name: null, color: 'black', found_area: 'Main Hall', found_at: now,
    state: 'found', bin_id: null, photo_path: null, sensitive: 0, created_by: null, created_at: now, updated_at: now,
    ...over,
  });
  insertAttributes(db, id, attrs);
  recordCreation(db, id, over.state ?? 'found', { userId: null, label: 'test' });
  return id;
}

import { hashPassword } from '../src/auth/password';
import type { FastifyInstance } from 'fastify';

export function makeUser(db: Db, venueId: string, role: 'staff' | 'admin' = 'staff', email = `${role}@test.dev`): string {
  const id = newId();
  db.prepare('INSERT INTO users (id, venue_id, email, name, role, password_hash, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, venueId, email, `Test ${role}`, role, hashPassword('pw'), nowIso());
  return id;
}

/** Log in via the API and return a Cookie header value. */
export async function loginCookie(app: FastifyInstance, email: string, password = 'pw'): Promise<string> {
  const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password } });
  const c = res.cookies.find((x) => x.name === 'vlf_session');
  if (!c) throw new Error(`login failed: ${res.body}`);
  return `vlf_session=${c.value}`;
}
