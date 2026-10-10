import type { FastifyRequest } from 'fastify';
import type { SessionUser } from '@vlf/shared';
import type { AppContext } from '../context';
import { forbidden, unauthorized } from '../errors';
import { userForSession } from './sessions';

export const SESSION_COOKIE = 'vlf_session';

/** Call first in a handler: `const user = requireStaff(app.ctx, req)`. Admins also pass. */
export function requireStaff(ctx: AppContext, req: FastifyRequest): SessionUser {
  const user = userForSession(ctx.db, req.cookies[SESSION_COOKIE]);
  if (!user) throw unauthorized();
  return user;
}

export function requireAdmin(ctx: AppContext, req: FastifyRequest): SessionUser {
  const user = requireStaff(ctx, req);
  if (user.role !== 'admin') throw forbidden('Admin only');
  return user;
}
