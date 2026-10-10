import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { loadCategoryRegistry } from '../src/services/categoryLoader';

describe('category loading', () => {
  it('auto-loads every file in the defs folder', async () => {
    const reg = await loadCategoryRegistry();
    expect(reg.has('phone')).toBe(true);
    expect(reg.has('wallet')).toBe(true);
  });
  it('GET /api/categories exposes form fields but not challenge templates', async () => {
    const { app } = await testApp();
    const res = await app.inject({ method: 'GET', url: '/api/categories' });
    const body = res.json();
    expect(body.map((c: { id: string }) => c.id)).toContain('phone');
    expect(JSON.stringify(body)).not.toContain('challengeTemplates');
  });
});
