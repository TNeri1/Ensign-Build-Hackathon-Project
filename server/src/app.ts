import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { ZodError } from 'zod';
import { AppError } from './errors';
import { registerRoutes } from './routes/loader';
import type { AppContext } from './context';

export async function buildApp(ctx: AppContext): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  app.decorate('ctx', ctx);
  await app.register(cookie);
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024, files: 1 } });

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof AppError) return reply.status(err.status).send({ error: err.message, code: err.code });
    if (err instanceof ZodError) {
      return reply.status(400).send({ error: 'Invalid request', code: 'validation', issues: err.issues });
    }
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    if (status >= 500) console.error(err);
    return reply.status(status).send({ error: status >= 500 ? 'Server error' : (err as Error).message });
  });

  await registerRoutes(app);
  return app;
}
