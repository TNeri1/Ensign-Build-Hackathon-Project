import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { makeVenue, makeUser, makeBin, loginCookie } from './fixtures';
import { listCustody } from '../src/services/custody';

async function multipart(data: unknown, photo?: Buffer) {
  const fd = new FormData();
  fd.append('data', JSON.stringify(data));
  if (photo) fd.append('photo', new Blob([new Uint8Array(photo)], { type: 'image/jpeg' }), 'p.jpg');
  const res = new Response(fd);
  return { payload: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type')! };
}

async function setup() {
  const t = await testApp();
  const venue = makeVenue(t.db);
  makeUser(t.db, venue, 'staff', 'sam@test.dev');
  const bin = makeBin(t.db, venue);
  const cookie = await loginCookie(t.app, 'sam@test.dev');
  return { ...t, bin, cookie };
}

const valid = { category: 'phone', color: 'black', foundArea: 'Gate 3', fields: { brand: 'Apple', model: 'iPhone 14' } };

describe('POST /api/items', () => {
  it('requires login', async () => {
    const { app } = await setup();
    const { payload, contentType } = await multipart(valid);
    const res = await app.inject({ method: 'POST', url: '/api/items', payload, headers: { 'content-type': contentType } });
    expect(res.statusCode).toBe(401);
  });

  it('creates an item with photo and bin, logs custody, stores private attributes', async () => {
    const { app, db, bin, cookie } = await setup();
    const { payload, contentType } = await multipart({ ...valid, binId: bin }, Buffer.from('fakejpeg'));
    const res = await app.inject({ method: 'POST', url: '/api/items', payload, headers: { 'content-type': contentType, cookie } });
    expect(res.statusCode).toBe(200);
    const { id } = res.json();

    const detail = (await app.inject({ method: 'GET', url: `/api/items/${id}`, headers: { cookie } })).json();
    expect(detail).toMatchObject({ state: 'stored', bin_id: bin, category: 'phone', sensitive: 0 });
    expect(detail.attributes).toContainEqual({ key: 'model', value: 'iPhone 14', is_public: 0 });
    expect(listCustody(db, id).map((e) => e.to_state)).toEqual(['found', 'stored']);

    const photo = await app.inject({ method: 'GET', url: `/api/items/${id}/photo`, headers: { cookie } });
    expect(photo.statusCode).toBe(200);
    expect(photo.headers['content-type']).toBe('image/jpeg');
    expect((await app.inject({ method: 'GET', url: `/api/items/${id}/photo` })).statusCode).toBe(401);
  });

  it('validates category fields and unknown categories', async () => {
    const { app, cookie } = await setup();
    for (const bad of [
      { ...valid, fields: { brand: 'Apple' } },
      { ...valid, category: 'spaceship' },
      { ...valid, color: 'chartreuse' },
    ]) {
      const { payload, contentType } = await multipart(bad);
      const res = await app.inject({ method: 'POST', url: '/api/items', payload, headers: { 'content-type': contentType, cookie } });
      expect(res.statusCode).toBe(400);
    }
  });

  it('works without a photo or bin (state stays found)', async () => {
    const { app, cookie } = await setup();
    const { payload, contentType } = await multipart(valid);
    const { id } = (await app.inject({ method: 'POST', url: '/api/items', payload, headers: { 'content-type': contentType, cookie } })).json();
    const detail = (await app.inject({ method: 'GET', url: `/api/items/${id}`, headers: { cookie } })).json();
    expect(detail.state).toBe('found');
  });
});

describe('bins', () => {
  it('creates bins and rejects duplicates', async () => {
    const { app, cookie } = await setup();
    const make = (code: string) => app.inject({ method: 'POST', url: '/api/bins', payload: { code, label: 'Shelf' }, headers: { cookie } });
    expect((await make('B2')).statusCode).toBe(200);
    expect((await make('B2')).statusCode).toBe(409);
    const list = (await app.inject({ method: 'GET', url: '/api/bins', headers: { cookie } })).json();
    expect(list.map((b: { code: string }) => b.code)).toEqual(['A1', 'B2']);
  });
});
