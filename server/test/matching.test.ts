import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { makeVenue, makeItem, makeUser, makeBin, loginCookie } from './fixtures';
import { listNotifications } from '../src/notify/outbox';

const report = {
  category: 'phone', color: 'black', area: 'Gate 3',
  windowStart: '2026-06-01T10:00:00.000Z', windowEnd: '2026-06-01T14:00:00.000Z',
  description: 'Black iPhone', contactEmail: 'Lena@Example.com',
};
const attrs = [
  { key: 'brand', value: 'Apple', isPublic: true },
  { key: 'model', value: 'iPhone 14', isPublic: false },
];

describe('matching on new lost report', () => {
  it('sends a claim-link notification for a matching stored item', async () => {
    const { app, db } = await testApp();
    const venue = makeVenue(db);
    makeItem(db, venue, { found_area: 'Gate 3', found_at: '2026-06-01T12:00:00.000Z', state: 'stored' }, attrs);
    const res = await app.inject({ method: 'POST', url: '/api/public/lost-reports', payload: report });
    expect(res.statusCode).toBe(200);
    expect(Object.keys(res.json())).toEqual(['id']); // no match info leaked
    const out = listNotifications(db) as { to: string; body: string }[];
    expect(out).toHaveLength(1);
    expect(out[0].to).toBe('lena@example.com');
    expect(out[0].body).toMatch(/\/claim\/[\w-]{20,}/);
  });

  it('does not notify below threshold or for other categories', async () => {
    const { app, db } = await testApp();
    const venue = makeVenue(db);
    makeItem(db, venue, { category: 'wallet', found_at: '2026-06-01T12:00:00.000Z', state: 'stored' }, []);
    makeItem(db, venue, { color: 'red', found_area: 'Parking', found_at: '2026-06-09T12:00:00.000Z', state: 'stored' }, attrs);
    await app.inject({ method: 'POST', url: '/api/public/lost-reports', payload: report });
    expect(listNotifications(db)).toHaveLength(0);
  });

  it('rejects invalid reports', async () => {
    const { app, db } = await testApp();
    makeVenue(db);
    for (const bad of [{ ...report, contactEmail: 'nope' }, { ...report, category: 'spaceship' }, { ...report, windowEnd: '2026-05-01T00:00:00.000Z' }]) {
      const res = await app.inject({ method: 'POST', url: '/api/public/lost-reports', payload: bad });
      expect(res.statusCode).toBe(400);
    }
  });
});

describe('matching on new intake', () => {
  it('notifies an existing report exactly once', async () => {
    const { app, db } = await testApp();
    const venue = makeVenue(db);
    makeUser(db, venue, 'staff', 'sam@test.dev');
    const bin = makeBin(db, venue);
    await app.inject({ method: 'POST', url: '/api/public/lost-reports', payload: report });
    const cookie = await loginCookie(app, 'sam@test.dev');
    const fd = new FormData();
    fd.append('data', JSON.stringify({
      category: 'phone', color: 'black', foundArea: 'Gate 3', foundAt: '2026-06-01T12:30:00.000Z', binId: bin,
      fields: { brand: 'Apple', model: 'iPhone 14' },
    }));
    const r = new Response(fd);
    const res = await app.inject({
      method: 'POST', url: '/api/items', payload: Buffer.from(await r.arrayBuffer()),
      headers: { cookie, 'content-type': r.headers.get('content-type')! },
    });
    expect(res.statusCode).toBe(200);
    expect(listNotifications(db)).toHaveLength(1);
    // GET outbox is open
    expect((await app.inject({ method: 'GET', url: '/api/outbox' })).json()).toHaveLength(1);
  });
});
