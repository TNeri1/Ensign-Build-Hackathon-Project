import { describe, it, expect, afterEach } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { testApp } from './helpers';
import { makeVenue, makeUser, loginCookie } from './fixtures';

/** A fake OpenAI-compatible local model server (stands in for Ollama / LM Studio). */
function fakeModel(handler: (body: Record<string, unknown>) => { status?: number; content?: string; delayMs?: number }) {
  const requests: Record<string, unknown>[] = [];
  const server = http.createServer((req, res) => {
    if (req.url?.endsWith('/models')) return res.end(JSON.stringify({ data: [{ id: 'fake-vl' }] }));
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const body = JSON.parse(raw);
      requests.push(body);
      const r = handler(body);
      setTimeout(() => {
        res.statusCode = r.status ?? 200;
        res.end(r.status && r.status >= 400 ? 'bad request' : JSON.stringify({ choices: [{ message: { content: r.content ?? '' } }] }));
      }, r.delayMs ?? 0);
    });
  });
  return new Promise<{ url: string; requests: typeof requests; close: () => void }>((resolve) =>
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      resolve({ url: `http://127.0.0.1:${port}/v1`, requests, close: () => server.close() });
    }));
}

const PNG = Buffer.from('89504e470d0a1a0a', 'hex');
async function photoPayload(type = 'image/png') {
  const fd = new FormData();
  fd.append('photo', new Blob([new Uint8Array(PNG)], { type }), 'p.png');
  const r = new Response(fd);
  return { payload: Buffer.from(await r.arrayBuffer()), contentType: r.headers.get('content-type')! };
}

let closers: (() => void)[] = [];
afterEach(() => { closers.forEach((c) => c()); closers = []; });

async function setup(visionUrl: string, visionTimeoutMs = 5000) {
  const t = await testApp({ visionUrl, visionModel: 'fake-vl', visionTimeoutMs });
  makeUser(t.db, makeVenue(t.db), 'staff', 'sam@test.dev');
  const cookie = await loginCookie(t.app, 'sam@test.dev');
  const describe = async (withCookie = true, type?: string) => {
    const { payload, contentType } = await photoPayload(type);
    return t.app.inject({ method: 'POST', url: '/api/vision/describe', payload, headers: { 'content-type': contentType, ...(withCookie ? { cookie } : {}) } });
  };
  return { ...t, cookie, describe };
}

const GOOD = JSON.stringify({ category: 'phone', color: 'black', fields: { brand: 'Apple', model: 'iPhone 14' }, summary: 'Black iPhone' });

describe('POST /api/vision/describe', () => {
  it('sends the photo to the local model and returns a validated suggestion', async () => {
    const m = await fakeModel(() => ({ content: GOOD }));
    closers.push(m.close);
    const s = await setup(m.url);
    const res = await s.describe();
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ suggestion: { category: 'phone', color: 'black', fields: { brand: 'Apple', model: 'iPhone 14' }, summary: 'Black iPhone' } });
    const req = m.requests[0] as { model: string; messages: { content: unknown }[] };
    expect(req.model).toBe('fake-vl');
    expect(JSON.stringify(req.messages[1].content)).toContain(`data:image/png;base64,${PNG.toString('base64')}`);
    expect(req.messages[0].content as string).toContain('"wallet" (Wallet)');
  });

  it('requires staff login and an image', async () => {
    const m = await fakeModel(() => ({ content: GOOD }));
    closers.push(m.close);
    const s = await setup(m.url);
    expect((await s.describe(false)).statusCode).toBe(401);
    expect((await s.describe(true, 'application/pdf')).statusCode).toBe(400);
  });

  it('retries without response_format when the server rejects it (LM Studio)', async () => {
    const m = await fakeModel((b) => (b.response_format ? { status: 400 } : { content: GOOD }));
    closers.push(m.close);
    const s = await setup(m.url);
    expect((await s.describe()).statusCode).toBe(200);
    expect(m.requests).toHaveLength(2);
  });

  it('503 with a helpful message when no model is running, 502 on garbage, 503 when turned off', async () => {
    const down = await setup('http://127.0.0.1:9/v1');
    const res = await down.describe();
    expect(res.statusCode).toBe(503);
    expect(res.json().error).toMatch(/No local vision model/);

    const m = await fakeModel(() => ({ content: 'I see a phone!' }));
    closers.push(m.close);
    expect((await (await setup(m.url)).describe()).statusCode).toBe(502);

    expect((await (await setup('off')).describe()).statusCode).toBe(503);
  });

  it('times out slow models', async () => {
    const m = await fakeModel(() => ({ content: GOOD, delayMs: 1500 }));
    closers.push(m.close);
    const res = await (await setup(m.url, 300)).describe();
    expect(res.statusCode).toBe(503);
    expect(res.json().error).toMatch(/timed out/);
  });
});

describe('GET /api/vision/status', () => {
  it('reports enabled/reachable/model and is staff-only', async () => {
    const m = await fakeModel(() => ({ content: GOOD }));
    closers.push(m.close);
    const s = await setup(m.url);
    expect((await s.app.inject({ method: 'GET', url: '/api/vision/status' })).statusCode).toBe(401);
    const up = await s.app.inject({ method: 'GET', url: '/api/vision/status', headers: { cookie: s.cookie } });
    expect(up.json()).toEqual({ enabled: true, reachable: true, model: 'fake-vl' });
    const off = await setup('off');
    expect((await off.app.inject({ method: 'GET', url: '/api/vision/status', headers: { cookie: off.cookie } })).json())
      .toEqual({ enabled: false, reachable: false, model: 'fake-vl' });
  });
});
