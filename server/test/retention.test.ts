import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { makeVenue, makeItem, makeUser, loginCookie } from './fixtures';
import { findOverdue, runRetentionJob, disposeBatch } from '../src/services/retention';
import { listCustody, transitionItem } from '../src/services/custody';
import { getItem } from '../src/repos/items';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

async function setup() {
  const t = await testApp();
  const venue = makeVenue(t.db);
  const adminId = makeUser(t.db, venue, 'admin', 'admin@test.dev');
  makeUser(t.db, venue, 'staff', 'sam@test.dev');
  // phone retention = 90 days, wallet = 60 days
  const oldPhone = makeItem(t.db, venue, { category: 'phone', found_at: daysAgo(100), state: 'stored' });
  const freshPhone = makeItem(t.db, venue, { category: 'phone', found_at: daysAgo(10), state: 'stored' });
  const oldWallet = makeItem(t.db, venue, { category: 'wallet', found_at: daysAgo(61), state: 'stored', sensitive: 1 });
  const inClaim = makeItem(t.db, venue, { category: 'phone', found_at: daysAgo(200), state: 'stored' });
  transitionItem(t.db, inClaim, 'claim_pending', { userId: null, label: 't' });
  return { ...t, venue, adminId, oldPhone, freshPhone, oldWallet, inClaim };
}

describe('retention', () => {
  it('finds only overdue items on the shelf, per category retention', async () => {
    const s = await setup();
    const ids = findOverdue(s.app.ctx).map((r) => r.id).sort();
    expect(ids).toEqual([s.oldPhone, s.oldWallet].sort());
  });

  it('flags once (idempotent) and lists flagged items with days overdue', async () => {
    const s = await setup();
    expect(runRetentionJob(s.app.ctx)).toBe(2);
    expect(runRetentionJob(s.app.ctx)).toBe(0);
    const cookie = await loginCookie(s.app, 'sam@test.dev');
    const list = (await s.app.inject({ method: 'GET', url: '/api/retention/flagged', headers: { cookie } })).json();
    expect(list).toHaveLength(2);
    expect(list.find((x: { id: string }) => x.id === s.oldPhone).daysOverdue).toBe(10);
    expect(list.find((x: { id: string }) => x.id === s.oldWallet).sensitive).toBe(1);
  });

  it('batch dispose is admin-only, custody-logged, and refuses unflagged items', async () => {
    const s = await setup();
    runRetentionJob(s.app.ctx);
    const staff = await loginCookie(s.app, 'sam@test.dev');
    const admin = await loginCookie(s.app, 'admin@test.dev');
    const post = (cookie: string, itemIds: string[]) =>
      s.app.inject({ method: 'POST', url: '/api/retention/dispose', payload: { itemIds }, headers: { cookie } });

    expect((await post(staff, [s.oldPhone])).statusCode).toBe(403);
    // one bad id rolls back the whole batch
    expect((await post(admin, [s.oldPhone, s.freshPhone])).statusCode).toBe(400);
    expect(getItem(s.db, s.oldPhone)?.state).toBe('stored');

    const ok = await post(admin, [s.oldPhone, s.oldWallet]);
    expect(ok.json()).toEqual({ disposed: 2 });
    expect(getItem(s.db, s.oldPhone)?.state).toBe('disposed');
    const last = listCustody(s.db, s.oldWallet).at(-1)!;
    expect(last).toMatchObject({ to_state: 'disposed', actor_user_id: s.adminId });
    expect(last.note).toMatch(/Retention/);
  });

  it('disposeBatch rejects an empty selection', async () => {
    const s = await setup();
    expect(() => disposeBatch(s.app.ctx, { id: s.adminId, name: 'A', email: '', role: 'admin', venueId: s.venue }, [])).toThrow();
  });
});

describe('sensitive photos', () => {
  it('are staff-only and never cached', async () => {
    const s = await setup();
    const fs = await import('node:fs');
    const path = await import('node:path');
    fs.writeFileSync(path.join(s.config.photoDir, 'sens.jpg'), 'x');
    const id = makeItem(s.db, s.venue, { category: 'wallet', sensitive: 1, photo_path: 'sens.jpg', state: 'stored' });
    expect((await s.app.inject({ method: 'GET', url: `/api/items/${id}/photo` })).statusCode).toBe(401);
    const cookie = await loginCookie(s.app, 'sam@test.dev');
    const res = await s.app.inject({ method: 'GET', url: `/api/items/${id}/photo`, headers: { cookie } });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
  });
});
