import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';

describe('health', () => {
  it('responds ok', async () => {
    const { app } = await testApp();
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });
});
