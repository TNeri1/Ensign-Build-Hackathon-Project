import fs from 'node:fs';
import path from 'node:path';
import type { AppContext } from '../context';
import { mulberry32, between } from './rng';
import { seedVenue } from './venueData';
import { randomPhone, randomWallet, type ItemSpec } from './itemData';
import { seedItem, type PATHS } from './lifecycle';
import { seedReports } from './reports';

const TABLES = ['claim_attempts', 'notifications', 'custody_events', 'claims', 'lost_reports', 'item_attributes', 'items', 'storage_bins', 'sessions', 'users', 'venues'];

/** Wipe all data (works while the dev server is running; the file itself is untouched). */
export function resetData(ctx: AppContext): void {
  ctx.db.transaction(() => { for (const t of TABLES) ctx.db.exec(`DELETE FROM ${t}`); })();
  if (fs.existsSync(ctx.config.photoDir)) {
    for (const f of fs.readdirSync(ctx.config.photoDir)) if (f !== '.gitkeep') fs.rmSync(path.join(ctx.config.photoDir, f));
  }
}

type PathName = keyof typeof PATHS;
/** [category, end state, how many] */
const PLAN: [ItemSpec['category'], PathName, number][] = [
  ['phone', 'stored', 8], ['phone', 'found', 2], ['phone', 'released', 2], ['phone', 'disposed', 1],
  ['wallet', 'stored', 8], ['wallet', 'released', 1], ['wallet', 'found', 1],
];
const BIN_FOR = { phone: ['A1', 'A2', 'B1'], wallet: ['S1'] } as const;

export function seedDatabase(ctx: AppContext) {
  resetData(ctx);
  const rng = mulberry32(42);
  const v = seedVenue(ctx.db);
  const who = { venueId: v.venueId, staffId: v.staffId, bins: v.bins };
  let n = 0;

  ctx.db.transaction(() => {
    for (const [category, end, count] of PLAN) {
      for (let i = 0; i < count; i++, n++) {
        const bins = BIN_FOR[category];
        const daysAgo = end === 'found' ? 0.1 + rng() * 0.5 : end === 'released' || end === 'disposed' ? between(rng, 8, 25) : between(rng, 1, 20);
        const spec = category === 'phone' ? randomPhone(rng, daysAgo < 2) : randomWallet(rng);
        seedItem(ctx, who, spec, daysAgo, end, bins[n % bins.length]);
      }
    }
    // Two items past retention (phone: 90d, wallet: 60d) so the retention page has something to show.
    seedItem(ctx, who, randomPhone(rng), 100, 'stored', 'B1');
    seedItem(ctx, who, randomWallet(rng), 70, 'stored', 'S1');
    seedReports(ctx.db, v.venueId);
  })();
  return { ...v, itemCount: n + 2 };
}
