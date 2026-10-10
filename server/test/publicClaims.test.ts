import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { makeVenue, makeItem, makeUser, loginCookie } from './fixtures';
import { listNotifications } from '../src/notify/outbox';
import { getItem } from '../src/repos/items';
import { MAX_LISTING_CLAIMS_PER_HOUR } from '../src/services/claims/start';

const phoneAttrs = [
  { key: 'brand', value: 'Apple', isPublic: true },
  { key: 'model', value: 'iPhone 14', isPublic: false },
  { key: 'lock_screen', value: 'golden retriever on a beach', isPublic: false },
];

async function setup() {
  const t = await testApp();
  const venue = makeVenue(t.db);
  const stored = makeItem(t.db, venue, { state: 'stored' }, phoneAttrs);
  const fresh = makeItem(t.db, venue, { state: 'found' }, phoneAttrs);
  const noPrivate = makeItem(t.db, venue, { state: 'stored', category: 'wallet' }, [{ key: 'material', value: 'Leather', isPublic: true }]);
  const start = (id: string, contactEmail = 'visitor@example.com') =>
    t.app.inject({ method: 'POST', url: `/api/public/items/${id}/claims`, payload: { contactEmail } });
  return { ...t, venue, stored, fresh, noPrivate, start };
}

describe('claim from the public listing', () => {
  it('marks only stored items as claimable in search results', async () => {
    const s = await setup();
    const list = (await s.app.inject({ method: 'GET', url: '/api/public/items' })).json() as { id: string; claimable: boolean }[];
    expect(list.find((i) => i.id === s.stored)?.claimable).toBe(true);
    expect(list.find((i) => i.id === s.fresh)?.claimable).toBe(false);
  });

  it('returns a claim token whose page asks the questions, and emails the link', async () => {
    const s = await setup();
    const res = await s.start(s.stored, 'Visitor@Example.com');
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Object.keys(body)).toEqual(['token']);
    expect(res.body).not.toContain('iPhone 14');

    const claim = (await s.app.inject({ method: 'GET', url: `/api/public/claims/${body.token}` })).json();
    expect(claim.status).toBe('open');
    expect(claim.questions.map((q: { field: string }) => q.field).sort()).toEqual(['lock_screen', 'model']);

    const out = listNotifications(s.db) as { to: string; body: string }[];
    expect(out).toHaveLength(1);
    expect(out[0].to).toBe('visitor@example.com');
    expect(out[0].body).toContain(`/claim/${body.token}`);
    expect(getItem(s.db, s.stored)?.state).toBe('stored'); // nothing changes until answers are submitted
  });

  it('feeds the normal review flow once answered', async () => {
    const s = await setup();
    makeUser(s.db, s.venue, 'staff', 'sam@test.dev');
    const { token } = (await s.start(s.stored)).json();
    const ans = await s.app.inject({ method: 'POST', url: `/api/public/claims/${token}/answers`, payload: { answers: { model: 'iPhone 14', lock_screen: 'golden retriever' } } });
    expect(ans.statusCode).toBe(200);
    expect(getItem(s.db, s.stored)?.state).toBe('claim_pending');
    const cookie = await loginCookie(s.app, 'sam@test.dev');
    const list = (await s.app.inject({ method: 'GET', url: '/api/claims?status=submitted', headers: { cookie } })).json();
    expect(list).toHaveLength(1);
  });

  it('refuses items still at intake, items without private details, unknown items and bad emails', async () => {
    const s = await setup();
    expect((await s.start(s.fresh)).statusCode).toBe(409);
    expect((await s.start(s.noPrivate)).statusCode).toBe(409);
    expect((await s.start('nope')).statusCode).toBe(404);
    expect((await s.start(s.stored, 'not-an-email')).statusCode).toBe(400);
    expect(listNotifications(s.db)).toHaveLength(0);
  });

  it('refuses items that are no longer listed (claim pending)', async () => {
    const s = await setup();
    const { token } = (await s.start(s.stored)).json();
    await s.app.inject({ method: 'POST', url: `/api/public/claims/${token}/answers`, payload: { answers: { model: 'x', lock_screen: 'y' } } });
    expect((await s.start(s.stored)).statusCode).toBe(404);
  });

  it('limits how many claims can be opened per item per hour', async () => {
    const s = await setup();
    for (let i = 0; i < MAX_LISTING_CLAIMS_PER_HOUR; i++) expect((await s.start(s.stored)).statusCode).toBe(200);
    expect((await s.start(s.stored)).statusCode).toBe(429);
  });
});
