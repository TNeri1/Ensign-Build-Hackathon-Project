import type { Db } from './db/connection';
import type { Config } from './config';

/** Everything a route or service may need. Built once in `buildApp`. */
export interface AppContext {
  db: Db;
  config: Config;
}

declare module 'fastify' {
  interface FastifyInstance {
    ctx: AppContext;
  }
}
