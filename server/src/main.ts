import { loadConfig } from './config';
import { openDb } from './db/connection';
import { runMigrations } from './db/migrate';
import { buildApp } from './app';
import { startRetentionTimer } from './services/retention';

const config = loadConfig();
const db = openDb(config.dbPath);
runMigrations(db);
const app = await buildApp({ db, config });
startRetentionTimer(app.ctx);
await app.listen({ port: config.port, host: '0.0.0.0' });
console.log(`API listening on http://localhost:${config.port}`);
