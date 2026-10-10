import type { Db } from './db/connection';
import type { Config } from './config';
import type { CategoryRegistry } from '@vlf/shared';

/** Everything a route or service may need. Built once in `buildApp`. */
export interface AppContext {
  db: Db;
  config: Config;
  categories: CategoryRegistry;
}

declare module 'fastify' {
  interface FastifyInstance {
    ctx: AppContext;
  }
}
