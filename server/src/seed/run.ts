import { loadConfig } from '../config';
import { openDb } from '../db/connection';
import { runMigrations } from '../db/migrate';
import { loadCategoryRegistry } from '../services/categoryLoader';
import { runRetentionJob } from '../services/retention';
import { seedDatabase } from './seedAll';
import { ADMIN_EMAIL, DEMO_PASSWORD, STAFF_EMAIL } from './venueData';
import { DEMO_ITEM } from './demo';

const config = loadConfig();
const db = openDb(config.dbPath);
runMigrations(db);
const ctx = { db, config, categories: await loadCategoryRegistry() };
const r = seedDatabase(ctx);
runRetentionJob(ctx);

console.log(`Seeded venue with ${r.itemCount} items, 3 lost reports.`);
console.log(`  staff: ${STAFF_EMAIL} / ${DEMO_PASSWORD}`);
console.log(`  admin: ${ADMIN_EMAIL} / ${DEMO_PASSWORD}`);
console.log(`Demo item to log live: ${DEMO_ITEM.category}, ${DEMO_ITEM.color}, ${DEMO_ITEM.foundArea}. See DEMO.md.`);
