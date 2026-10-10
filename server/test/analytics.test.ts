import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { makeVenue, makeItem, makeBin, makeUser, loginCookie } from './fixtures';
import { computeAnalytics, median } from '../src/services/analytics';
import { transitionItem } from '../src/services/custody';

describe('median', () => {
  it('handles empty, odd and even lengths', () => {
    expect(median([])).toBeNull();
    expect(median([5, 1, 3])).toBe(3);
    expect(median([1, 2, 3, 10])).toBe(2.5);
  });
});

describe('computeAnalytics', () => {
  it('counts states, bins, claims, locations and return time', async () => {
    const { db, app } = await testApp();
    const v = makeVenue(db);
    makeUser(db, v, 'admin', 'admin@test.dev');
    makeUser(db, v, 'staff', 'sam@test.dev');
    const bin = makeBin(db, v, 'A1');
    makeBin(db, v, 'B2');
    const a = makeItem(db, v, { state: 'stored', bin_id: bin, found_area: 'Gate 3' });
    makeItem(db, v, { state: 'stored', bin_id: bin, found_area: 'Gate 3' });
    makeItem(db, v, { found_area: 'Lobby' });
    const actor = { userId: null, label: 't' };
    transitionItem(db, a, 'claim_pending', actor);
    transitionItem(db, a, 'verified', actor);
    transitionItem(db, a, 'released', actor);
    // pin the elapsed time to exactly 6 hours
    db.prepare(`UPDATE custody_events SET at = '2026-06-01T10:00:00.000Z' WHERE item_id = ? AND from_state IS NULL`).run(a);
    db.prepare(`UPDATE custody_events SET at = '2026-06-01T16:00:00.000Z' WHERE item_id = ? AND to_state = 'released'`).run(a);

    const r = computeAnalytics(db, v);
    expect(r.totalItems).toBe(3);
    expect(r.byState.find((s) => s.state === 'released')?.count).toBe(1);
    expect(r.byBin).toEqual([{ bin: 'A1', label: 'Bin A1', count: 1 }, { bin: 'B2', label: 'Bin B2', count: 0 }]);
    expect(r.returnRate).toBeCloseTo(1 / 3);
    expect(r.medianHoursToReturn).toBeCloseTo(6, 3);
    expect(r.topLocations[0]).toEqual({ area: 'Gate 3', count: 2 });

    // route is admin-only
    const staff = await loginCookie(app, 'sam@test.dev');
    expect((await app.inject({ method: 'GET', url: '/api/admin/analytics', headers: { cookie: staff } })).statusCode).toBe(403);
    const admin = await loginCookie(app, 'admin@test.dev');
    expect((await app.inject({ method: 'GET', url: '/api/admin/analytics', headers: { cookie: admin } })).statusCode).toBe(200);
  });

  it('is safe on an empty venue', async () => {
    const { db } = await testApp();
    const r = computeAnalytics(db, makeVenue(db));
    expect(r).toMatchObject({ totalItems: 0, returnRate: 0, medianHoursToReturn: null });
  });
});
