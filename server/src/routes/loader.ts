import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

const dir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Auto-register every `*.routes.ts` file in this folder.
 * A route file default-exports a FastifyPluginAsync. To add an API area,
 * create `<name>.routes.ts`; no other file needs editing.
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  const files = fs.readdirSync(dir).filter((f) => /\.routes\.(ts|js)$/.test(f)).sort();
  for (const file of files) {
    const mod = (await import(pathToUrl(path.join(dir, file)))) as { default: FastifyPluginAsync };
    await app.register(mod.default, { prefix: '/api' });
  }
}

function pathToUrl(p: string): string {
  return new URL(`file://${p}`).href;
}
