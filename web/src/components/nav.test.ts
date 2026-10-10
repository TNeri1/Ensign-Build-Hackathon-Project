// @vitest-environment node
import { describe, it, expect } from 'vitest';
import type { SessionUser } from '@vlf/shared';
import { destinations, MAX_PRIMARY } from './nav';

const user = (role: SessionUser['role']): SessionUser => ({
  id: 'u1', name: 'Test', email: `${role}@venue.test`, role, venueId: 'v1',
});
const labels = (xs: { label: string }[]) => xs.map((x) => x.label);

describe('destinations', () => {
  it('logged out: public destinations and a staff login entry', () => {
    const d = destinations(null);
    expect(labels(d.primary)).toEqual(['Home', 'Search', 'Report lost', 'Outbox']);
    expect(d.primary.map((x) => x.to)).toEqual(['/', '/search', '/report', '/outbox']);
    expect(d.overflow).toEqual([{ label: 'Staff login', icon: 'login', to: '/login' }]);
  });

  it('staff: work destinations, extras in overflow, log out action', () => {
    const d = destinations(user('staff'));
    expect(labels(d.primary)).toEqual(['Inventory', 'Claims', 'Pickup', 'Lost reports', 'Outbox']);
    expect(d.primary[0]).toMatchObject({ to: '/staff', icon: 'inventory_2', end: true });
    expect(d.primary.map((x) => x.icon)).toEqual(['inventory_2', 'assignment', 'qr_code_scanner', 'campaign', 'inbox']);
    expect(labels(d.overflow)).toEqual(['Log item', 'Bins & labels', 'Public search', 'Log out']);
    expect(d.overflow.at(-1)).toMatchObject({ action: 'logout' });
    expect(d.overflow.find((o) => o.label === 'Log item')?.to).toBe('/staff/intake');
  });

  it('admin: dashboard first, retention and outbox move to overflow', () => {
    const d = destinations(user('admin'));
    expect(labels(d.primary)).toEqual(['Dashboard', 'Inventory', 'Claims', 'Pickup', 'Lost reports']);
    expect(d.primary[0]).toMatchObject({ to: '/admin', icon: 'dashboard', end: true });
    expect(labels(d.overflow)).toEqual(['Retention', 'Outbox', 'Log item', 'Bins & labels', 'Public search', 'Log out']);
    expect(d.overflow[0].to).toBe('/admin/retention');
  });

  it(`never has more than ${MAX_PRIMARY} primary destinations, and overflow items have a route or action`, () => {
    for (const u of [null, user('staff'), user('admin')]) {
      const d = destinations(u);
      expect(d.primary.length).toBeLessThanOrEqual(MAX_PRIMARY);
      for (const o of d.overflow) expect(Boolean(o.to) !== Boolean(o.action)).toBe(true);
      expect(new Set(d.primary.map((x) => x.to)).size).toBe(d.primary.length);
    }
  });

  it('rail FAB: Log item for staff and admin, none for public (Report lost is already a destination)', () => {
    expect(destinations(null).railFab).toBeUndefined();
    for (const u of [user('staff'), user('admin')]) {
      expect(destinations(u).railFab).toEqual({ label: 'Log item', icon: 'add', to: '/staff/intake' });
    }
  });
});
