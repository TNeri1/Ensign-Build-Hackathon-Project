import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { makeVenue, makeItem } from './fixtures';

/**
 * No public API response may contain a private attribute value, a photo path or a photo URL.
 * ADD every new unauthenticated GET route to PUBLIC_URLS (receives the seeded item id).
 */
const PUBLIC_URLS = (itemId: string) => [
  '/api/public/categories',
  '/api/public/items',
  '/api/public/items?category=phone',
  '/api/public/items?q=Apple',
  `/api/public/items/${itemId}`,
];

const PRIVATE_MARKERS = ['SECRETMODEL-9981', 'SECRET-LOCKSCREEN-dog-on-beach', 'IMEI-123456789'];
const PHOTO_NAME = 'photo-abc123.jpg';

describe('public API never leaks private data', () => {
  it('contains no private attribute values, photo names or photo URLs', async () => {
    const { app, db } = await testApp();
    const venue = makeVenue(db);
    const id = makeItem(db, venue, { category: 'phone', photo_path: PHOTO_NAME, state: 'stored' }, [
      { key: 'brand', value: 'Apple', isPublic: true },
      { key: 'model', value: PRIVATE_MARKERS[0], isPublic: false },
      { key: 'lock_screen', value: PRIVATE_MARKERS[1], isPublic: false },
      { key: 'imei', value: PRIVATE_MARKERS[2], isPublic: false },
    ]);
    const urls = PUBLIC_URLS(id);
    for (const url of urls) {
      const res = await app.inject({ method: 'GET', url });
      expect(res.statusCode, url).toBe(200);
      const body = res.body.toLowerCase();
      for (const marker of [...PRIVATE_MARKERS, PHOTO_NAME, '/photo', 'photo_path', 'photourl']) {
        expect(body, `${url} leaked ${marker}`).not.toContain(marker.toLowerCase());
      }
    }
    // sanity: the public data itself is present
    const list = await app.inject({ method: 'GET', url: '/api/public/items' });
    expect(list.body).toContain('Apple');
  });
});
