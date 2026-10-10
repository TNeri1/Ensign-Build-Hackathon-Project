import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { loginCookie } from './fixtures';
import { seedDatabase } from '../src/seed/seedAll';
import { DEMO_ANSWERS, DEMO_ITEM } from '../src/seed/demo';
import { ADMIN_EMAIL, DEMO_PASSWORD, STAFF_EMAIL } from '../src/seed/venueData';

/** Mirrors DEMO.md step by step. If this breaks, the demo script is out of date. */
describe('DEMO.md flow on seed data', () => {
  it('runs end to end', async () => {
    const { app } = await testApp();
    seedDatabase(app.ctx);
    const staff = await loginCookie(app, STAFF_EMAIL, DEMO_PASSWORD);
    const admin = await loginCookie(app, ADMIN_EMAIL, DEMO_PASSWORD);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const j = async (r: PromiseLike<{ json: () => any }>) => (await r).json();

    // 1. a lost report already exists, and the Outbox is empty
    expect(await j(app.inject({ method: 'GET', url: '/api/outbox' }))).toHaveLength(0);
    expect(await j(app.inject({ method: 'GET', url: '/api/reports', headers: { cookie: staff } }))).toHaveLength(3);

    // 2. staff live intake into bin A1
    const bins = await j(app.inject({ method: 'GET', url: '/api/bins', headers: { cookie: staff } }));
    const binId = bins.find((b: { code: string }) => b.code === 'A1').id;
    const fd = new FormData();
    fd.append('data', JSON.stringify({ ...DEMO_ITEM, binId }));
    const body = new Response(fd);
    const created = await j(app.inject({
      method: 'POST', url: '/api/items', payload: Buffer.from(await body.arrayBuffer()),
      headers: { cookie: staff, 'content-type': body.headers.get('content-type')! },
    }));
    expect(created.id).toBeTruthy();

    // 3. notification in the Outbox with a claim link
    const outbox = await j(app.inject({ method: 'GET', url: '/api/outbox' }));
    expect(outbox).toHaveLength(1);
    expect(outbox[0].to).toBe('lena.ortiz@example.com');
    const token = outbox[0].body.match(/\/claim\/([\w-]+)/)[1];

    // 4. claimant answers the challenge questions
    const view = await j(app.inject({ method: 'GET', url: `/api/public/claims/${token}` }));
    expect(view.questions).toHaveLength(4);
    const answers = Object.fromEntries(view.questions.map((q: { field: keyof typeof DEMO_ANSWERS }) => [q.field, DEMO_ANSWERS[q.field]]));
    expect((await app.inject({ method: 'POST', url: `/api/public/claims/${token}/answers`, payload: { answers } })).statusCode).toBe(200);

    // 5. staff compare and approve
    const [pending] = await j(app.inject({ method: 'GET', url: '/api/claims?status=submitted', headers: { cookie: staff } }));
    const review = await j(app.inject({ method: 'GET', url: `/api/claims/${pending.id}`, headers: { cookie: staff } }));
    expect(review.comparisons.every((c: { autoMatch: boolean }) => c.autoMatch)).toBe(true);
    const ok = await app.inject({ method: 'POST', url: `/api/claims/${pending.id}/decision`, payload: { decision: 'approve' }, headers: { cookie: staff } });
    expect(ok.statusCode).toBe(200);

    // 6. pickup QR scanned, ID checked, released
    const code = `vlf:pickup:${token}`;
    await app.inject({ method: 'POST', url: '/api/pickup/lookup', payload: { code }, headers: { cookie: staff } });
    const rel = await app.inject({ method: 'POST', url: '/api/pickup/release', payload: { code, idChecked: true }, headers: { cookie: staff } });
    expect(rel.statusCode).toBe(200);

    // 7. custody log and dashboard
    const item = await j(app.inject({ method: 'GET', url: `/api/items/${created.id}`, headers: { cookie: staff } }));
    expect(item.state).toBe('released');
    expect(item.custody.map((e: { to_state: string }) => e.to_state)).toEqual(['found', 'stored', 'claim_pending', 'verified', 'released']);
    const stats = await j(app.inject({ method: 'GET', url: '/api/admin/analytics', headers: { cookie: admin } }));
    expect(stats.byState.find((s: { state: string }) => s.state === 'released').count).toBe(4);
    expect(stats.totalItems).toBe(26);
  });
});
