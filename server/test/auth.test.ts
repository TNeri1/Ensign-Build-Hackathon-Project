import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { makeVenue, makeUser, loginCookie } from './fixtures';
import { hashPassword, verifyPassword } from '../src/auth/password';

describe('password hashing', () => {
  it('verifies correct and rejects wrong passwords', () => {
    const h = hashPassword('secret');
    expect(verifyPassword('secret', h)).toBe(true);
    expect(verifyPassword('wrong', h)).toBe(false);
    expect(verifyPassword('x', 'garbage')).toBe(false);
  });
});

describe('auth routes', () => {
  it('logs in, returns me, logs out', async () => {
    const { app, db } = await testApp();
    makeUser(db, makeVenue(db), 'staff', 'sam@test.dev');
    const cookie = await loginCookie(app, 'sam@test.dev');
    const me = await app.inject({ method: 'GET', url: '/api/auth/me', headers: { cookie } });
    expect(me.json()).toMatchObject({ email: 'sam@test.dev', role: 'staff' });
    await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { cookie } });
    const after = await app.inject({ method: 'GET', url: '/api/auth/me', headers: { cookie } });
    expect(after.statusCode).toBe(401);
  });
  it('rejects bad credentials', async () => {
    const { app, db } = await testApp();
    makeUser(db, makeVenue(db), 'staff', 'sam@test.dev');
    const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'sam@test.dev', password: 'nope' } });
    expect(res.statusCode).toBe(401);
  });
});
