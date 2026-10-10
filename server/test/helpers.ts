import { openDb } from '../src/db/connection';
import { runMigrations } from '../src/db/migrate';
import { buildApp } from '../src/app';
import { loadConfig } from '../src/config';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

/** Fresh in-memory DB with all migrations applied. */
export function testDb() {
  const db = openDb(':memory:');
  runMigrations(db);
  return db;
}

/** Fresh app over an in-memory DB and a temp photo dir. */
export async function testApp(overrides: Partial<ReturnType<typeof loadConfig>> = {}) {
  const db = testDb();
  const photoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vlf-photos-'));
  const config = { ...loadConfig({}), photoDir, ...overrides };
  const app = await buildApp({ db, config });
  return { app, db, config };
}
