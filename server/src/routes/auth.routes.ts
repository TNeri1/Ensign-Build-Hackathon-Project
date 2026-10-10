import type { FastifyPluginAsync } from 'fastify';
import { loginSchema } from '@vlf/shared';
import { verifyPassword } from '../auth/password';
import { createSession, deleteSession, userForSession } from '../auth/sessions';
import { SESSION_COOKIE } from '../auth/guard';
import { AppError, unauthorized } from '../errors';

const routes: FastifyPluginAsync = async (app) => {
  const { db } = app.ctx;

  app.post('/auth/login', async (req, reply) => {
    const { email, password } = loginSchema.parse(req.body);
    const row = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email.toLowerCase()) as
      | { id: string; password_hash: string }
      | undefined;
    if (!row || !verifyPassword(password, row.password_hash)) throw new AppError(401, 'Invalid email or password');
    const token = createSession(db, row.id);
    reply.setCookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 12 * 3600 });
    return userForSession(db, token);
  });

  app.post('/auth/logout', async (req, reply) => {
    const token = req.cookies[SESSION_COOKIE];
    if (token) deleteSession(db, token);
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  });

  app.get('/auth/me', async (req) => {
    const user = userForSession(db, req.cookies[SESSION_COOKIE]);
    if (!user) throw unauthorized();
    return user;
  });
};
export default routes;
