import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { makeVenue, makeItem, makeUser, makeBin, loginCookie } from './fixtures';
import { listNotifications } from '../src/notify/outbox';
import { listCustody } from '../src/services/custody';
import { getItem } from '../src/repos/items';
import { MAX_ATTEMPTS } from '../src/services/claims/submit';

const report = {
  category: 'phone', color: 'black', area: 'Gate 3',
  windowStart: '2026-06-01T10:00:00.000Z', windowEnd: '2026-06-01T14:00:00.000Z', description: '', contactEmail: 'lena@example.com',
};

async function setup() {
  const t = await testApp();
  const venue = makeVenue(t.db);
  makeUser(t.db, venue, 'staff', 'sam@test.dev');
  const bin = makeBin(t.db, venue);
  const itemId = makeItem(t.db, venue, { found_area: 'Gate 3', found_at: '2026-06-01T12:00:00.000Z', state: 'stored', bin_id: bin }, [
    { key: 'brand', value: 'Apple', isPublic: true },
    { key: 'model', value: 'iPhone 14', isPublic: false },
    { key: 'lock_screen', value: 'golden retriever on a beach', isPublic: false },
  ]);
  await t.app.inject({ method: 'POST', url: '/api/public/lost-reports', payload: report });
  const body = (listNotifications(t.db) as { body: string }[])[0].body;
  const token = body.match(/\/claim\/([\w-]+)/)![1];
  const cookie = await loginCookie(t.app, 'sam@test.dev');
  return { ...t, itemId, token, cookie };
}
type S = Awaited<ReturnType<typeof setup>>;
const answer = (s: S, answers: Record<string, string>, token = s.token) =>
  s.app.inject({ method: 'POST', url: `/api/public/claims/${token}/answers`, payload: { answers } });
const good = { model: 'iPhone 14 Pro', lock_screen: 'A golden retriever on a beach' };

describe('claim flow', () => {
  it('claimant sees questions but never expected answers', async () => {
    const s = await setup();
    const res = await s.app.inject({ method: 'GET', url: `/api/public/claims/${s.token}` });
    const body = res.json();
    expect(body.questions.map((q: { field: string }) => q.field).sort()).toEqual(['lock_screen', 'model']);
    expect(res.body).not.toContain('golden retriever');
    expect(res.body).not.toContain('iPhone 14');
    expect((await s.app.inject({ method: 'GET', url: '/api/public/claims/not-a-token' })).statusCode).toBe(404);
  });

  it('full happy path: answer -> approve -> pickup lookup -> release', async () => {
    const s = await setup();
    expect((await answer(s, good)).statusCode).toBe(200);
    expect(getItem(s.db, s.itemId)?.state).toBe('claim_pending');

    const list = (await s.app.inject({ method: 'GET', url: '/api/claims?status=submitted', headers: { cookie: s.cookie } })).json();
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Apple phone');
    const cmp = (await s.app.inject({ method: 'GET', url: `/api/claims/${list[0].id}`, headers: { cookie: s.cookie } })).json();
    expect(cmp.comparisons.every((c: { autoMatch: boolean }) => c.autoMatch)).toBe(true);
    expect(cmp.comparisons[0]).toHaveProperty('expected');
    expect(cmp.comparisons.map((c: { verdict: string }) => c.verdict)).toEqual(['match', 'match']);

    const dec = await s.app.inject({ method: 'POST', url: `/api/claims/${list[0].id}/decision`, payload: { decision: 'approve' }, headers: { cookie: s.cookie } });
    expect(dec.statusCode).toBe(200);
    expect(getItem(s.db, s.itemId)?.state).toBe('verified');

    const code = `vlf:pickup:${s.token}`;
    const look = await s.app.inject({ method: 'POST', url: '/api/pickup/lookup', payload: { code }, headers: { cookie: s.cookie } });
    expect(look.json().claimantEmail).toBe('lena@example.com');
    expect(look.json().item.title).toBe('Apple phone'); // brand is public, no name given

    const noId = await s.app.inject({ method: 'POST', url: '/api/pickup/release', payload: { code, idChecked: false }, headers: { cookie: s.cookie } });
    expect(noId.statusCode).toBe(400);
    const rel = await s.app.inject({ method: 'POST', url: '/api/pickup/release', payload: { code, idChecked: true }, headers: { cookie: s.cookie } });
    expect(rel.statusCode).toBe(200);
    expect(getItem(s.db, s.itemId)?.state).toBe('released');

    const again = await s.app.inject({ method: 'POST', url: '/api/pickup/release', payload: { code, idChecked: true }, headers: { cookie: s.cookie } });
    expect(again.statusCode).toBe(409); // one-time

    expect(listCustody(s.db, s.itemId).map((e) => e.to_state)).toEqual(['stored', 'claim_pending', 'verified', 'released']);
    const subjects = (listNotifications(s.db) as { subject: string }[]).map((n) => n.subject);
    expect(subjects).toContain('Your claim was approved');
  });

  it('pickup does not work before approval', async () => {
    const s = await setup();
    await answer(s, good);
    const res = await s.app.inject({ method: 'POST', url: '/api/pickup/lookup', payload: { code: s.token }, headers: { cookie: s.cookie } });
    expect(res.statusCode).toBe(409);
  });

  it('deny requires a reason and returns the item to stored', async () => {
    const s = await setup();
    await answer(s, { model: 'Pixel', lock_screen: 'cat' });
    const [c] = (await s.app.inject({ method: 'GET', url: '/api/claims', headers: { cookie: s.cookie } })).json();
    const post = (payload: object) => s.app.inject({ method: 'POST', url: `/api/claims/${c.id}/decision`, payload, headers: { cookie: s.cookie } });
    expect((await post({ decision: 'deny' })).statusCode).toBe(400);
    expect((await post({ decision: 'deny', reason: 'Answers do not match' })).statusCode).toBe(200);
    expect(getItem(s.db, s.itemId)?.state).toBe('stored');
    const view = (await s.app.inject({ method: 'GET', url: `/api/public/claims/${s.token}` })).json();
    expect(view).toMatchObject({ status: 'denied', decisionReason: 'Answers do not match' });
  });

  it('rejects incomplete answers, double submit, and staff routes without login', async () => {
    const s = await setup();
    expect((await answer(s, { model: 'x' })).statusCode).toBe(400);
    expect((await answer(s, good)).statusCode).toBe(200);
    expect((await answer(s, good)).statusCode).toBe(409);
    expect((await s.app.inject({ method: 'GET', url: '/api/claims' })).statusCode).toBe(401);
    expect((await s.app.inject({ method: 'POST', url: '/api/pickup/release', payload: { code: s.token, idChecked: true } })).statusCode).toBe(401);
  });

  it('rate-limits attempts per item', async () => {
    const s = await setup();
    for (let i = 0; i < MAX_ATTEMPTS; i++) await answer(s, { model: 'x' }); // 400s still consume attempts
    const res = await answer(s, good);
    expect(res.statusCode).toBe(429);
  });
});
