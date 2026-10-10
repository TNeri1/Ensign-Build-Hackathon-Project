import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { makeVenue, makeItem } from './fixtures';
import { transitionItem } from '../src/services/custody';

async function setup() {
  const t = await testApp();
  const venue = makeVenue(t.db);
  const phone = makeItem(t.db, venue, { category: 'phone', color: 'black', found_area: 'Gate 3' }, [
    { key: 'brand', value: 'Apple', isPublic: true },
    { key: 'model', value: 'iPhone 14', isPublic: false },
  ]);
  const wallet = makeItem(t.db, venue, { category: 'wallet', color: 'brown', found_area: 'Food Court', state: 'found' }, [
    { key: 'material', value: 'Leather', isPublic: true },
  ]);
  return { ...t, venue, phone, wallet };
}
const get = (app: Awaited<ReturnType<typeof testApp>>['app'], url: string) => app.inject({ method: 'GET', url });

describe('public search', () => {
  it('lists redacted items and filters', async () => {
    const { app } = await setup();
    const all = (await get(app, '/api/public/items')).json();
    expect(all).toHaveLength(2);
    const phones = (await get(app, '/api/public/items?category=phone')).json();
    expect(phones).toHaveLength(1);
    expect(phones[0]).toMatchObject({ categoryLabel: 'Phone', color: 'black', area: 'Gate 3', details: [{ label: 'Brand', value: 'Apple' }] });
    expect((await get(app, '/api/public/items?area=food')).json()).toHaveLength(1);
    expect((await get(app, '/api/public/items?q=leather')).json()).toHaveLength(1);
    expect((await get(app, '/api/public/items?q=iPhone')).json()).toHaveLength(0); // private values are not searchable
  });

  it('hides items that are claimed, released or disposed', async () => {
    const { app, db, phone, wallet } = await setup();
    transitionItem(db, phone, 'stored', { userId: null, label: 't' });
    transitionItem(db, phone, 'claim_pending', { userId: null, label: 't' });
    transitionItem(db, wallet, 'disposed', { userId: null, label: 't' });
    expect((await get(app, '/api/public/items')).json()).toHaveLength(0);
    expect((await get(app, `/api/public/items/${phone}`)).statusCode).toBe(404);
  });

  it('returns a single public item', async () => {
    const { app, phone } = await setup();
    const res = await get(app, `/api/public/items/${phone}`);
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(phone);
  });
});
