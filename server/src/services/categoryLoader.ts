import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry, type CategoryRegistry } from '@vlf/shared';

const DEFS_DIR = fileURLToPath(new URL('../../../shared/src/categories/defs', import.meta.url));

/**
 * Auto-load every file in shared/src/categories/defs/. Adding a category = adding a file there.
 * Each file default-exports `defineCategory({...})`.
 */
export async function loadCategoryRegistry(dir: string = DEFS_DIR): Promise<CategoryRegistry> {
  const files = fs.readdirSync(dir).filter((f) => /\.(ts|js)$/.test(f) && !f.endsWith('.test.ts')).sort();
  const defs: unknown[] = [];
  for (const f of files) {
    const mod = (await import(new URL(`file://${path.join(dir, f)}`).href)) as { default: unknown };
    defs.push(mod.default);
  }
  return buildRegistry(defs);
}
