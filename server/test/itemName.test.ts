import { describe, it, expect } from 'vitest';
import { itemTitle } from '@vlf/shared';
import { testApp, testDb } from './helpers';
import { makeVenue, makeUser, makeBin, makeItem, loginCookie } from './fixtures';
import { openDb } from '../src/db/connection';
import { runMigrations } from '../src/db/migrate';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

describe('itemTitle', () => {
  it('name > "<brand> <category>" > category', () => {
    expect(itemTitle('AirPods case', 'Other', 'Apple')).toBe('AirPods case');
    expect(itemTitle('  ', 'Phone', 'Apple')).toBe('Apple phone');
    expect(itemTitle(null, 'Water bottle', null)).toBe('Water bottle');
  });
});

async function intake(t: Awaited<ReturnType<typeof testApp>>, cookie: string, data: object) {
  const fd = new FormData();
  fd.append('data', JSON.stringify(data));
  const r = new Response(fd);
  return t.app.inject({ method: 'POST', url: '/api/items', payload: Buffer.from(await r.arrayBuffer()), headers: { cookie, 'content-type': r.headers.get('content-type')! } });
}

describe('item name at intake and in staff APIs', () => {
  it('stores the name, requires it for "other", and every staff view uses the title', async () => {
    const t = await testApp();
    const venue = makeVenue(t.db);
    makeUser(t.db, venue, 'staff', 'sam@test.dev');
    const bin = makeBin(t.db, venue);
    const cookie = await loginCookie(t.app, 'sam@test.dev');
    const base = { color: 'white', foundArea: 'Gate 5', binId: bin };

    const noName = await intake(t, cookie, { ...base, category: 'other', fields: { description: 'small white case' } });
    expect(noName.statusCode).toBe(400);
    expect(noName.json().error).toMatch(/Item name is required/);

    const ok = await intake(t, cookie, { ...base, category: 'other', name: 'AirPods case', fields: { description: 'small white case' } });
    expect(ok.statusCode).toBe(200);
    const phone = await intake(t, cookie, { ...base, category: 'phone', fields: { brand: 'Apple', model: 'iPhone 14' } }); // name optional
    expect(phone.statusCode).toBe(200);

    const list = (await t.app.inject({ method: 'GET', url: '/api/items', headers: { cookie } })).json() as { title: string; name: string | null }[];
    expect(list.map((i) => i.title).sort()).toEqual(['AirPods case', 'Apple phone']);
    const detail = (await t.app.inject({ method: 'GET', url: `/api/items/${ok.json().id}`, headers: { cookie } })).json();
    expect(detail).toMatchObject({ name: 'AirPods case', title: 'AirPods case' });
  });
});

describe('migration 003', () => {
  it('moves the old "other" item_type attribute into items.name', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'vlf-mig-')), 'db.sqlite');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vlf-migs-'));
    const src = new URL('../src/db/migrations/', import.meta.url);
    for (const f of ['001_core.sql', '002_retention.sql']) fs.copyFileSync(new URL(f, src), path.join(dir, f));
    const db = openDb(file);
    runMigrations(db, dir);
    db.prepare(`INSERT INTO venues VALUES ('v', 'V', 'now')`).run();
    db.prepare(`INSERT INTO items (id, venue_id, category, color, found_area, found_at, state, created_at, updated_at) VALUES ('i1','v','other','white','Gate','2026-01-01','stored','x','x')`).run();
    db.prepare(`INSERT INTO item_attributes (item_id, key, value, is_public) VALUES ('i1','item_type','AirPods case',1), ('i1','brand','Apple',1)`).run();
    fs.copyFileSync(new URL('003_item_name.sql', src), path.join(dir, '003_item_name.sql'));
    expect(runMigrations(db, dir)).toEqual(['003_item_name.sql']);
    expect(db.prepare(`SELECT name FROM items WHERE id = 'i1'`).get()).toEqual({ name: 'AirPods case' });
    expect(db.prepare(`SELECT key FROM item_attributes WHERE item_id = 'i1' ORDER BY key`).all()).toEqual([{ key: 'brand' }]);
  });

  it('fresh databases have the column', () => {
    const db = testDb();
    const v = makeVenue(db);
    makeItem(db, v, { name: 'Test' });
    expect(db.prepare('SELECT name FROM items').get()).toEqual({ name: 'Test' });
  });
});
