import { describe, it, expect } from 'vitest';
import { testApp } from './helpers';
import { seedDatabase } from '../src/seed/seedAll';
import { DEMO_ITEM, DEMO_REPORT, DEMO_ANSWERS } from '../src/seed/demo';
import { scoreMatch, defaultMatchConfig } from '../src/services/matching/score';
import { computeAnalytics } from '../src/services/analytics';
import { runRetentionJob } from '../src/services/retention';
import { listNotifications } from '../src/notify/outbox';
import { buildChallenges, checkAnswer } from '@vlf/shared';

describe('seed data', () => {
  it('builds a realistic, self-consistent dataset', async () => {
    const { app } = await testApp();
    const ctx = app.ctx;
    seedDatabase(ctx);
    seedDatabase(ctx); // re-seeding must reset, not duplicate

    const count = (sql: string) => (ctx.db.prepare(sql).get() as { n: number }).n;
    expect(count('SELECT COUNT(*) n FROM venues')).toBe(1);
    expect(count('SELECT COUNT(*) n FROM items')).toBe(25);
    expect(count('SELECT COUNT(*) n FROM items WHERE sensitive = 1')).toBeGreaterThanOrEqual(1);
    expect(count('SELECT COUNT(*) n FROM storage_bins')).toBeGreaterThanOrEqual(3);
    expect(count('SELECT COUNT(*) n FROM lost_reports')).toBe(3);
    expect(count(`SELECT COUNT(*) n FROM users WHERE role = 'admin'`)).toBe(1);
    expect(listNotifications(ctx.db)).toHaveLength(0); // Outbox starts clean

    expect(runRetentionJob(ctx)).toBe(2);
    const venue = (ctx.db.prepare('SELECT id FROM venues').get() as { id: string }).id;
    const a = computeAnalytics(ctx.db, venue);
    expect(a.medianHoursToReturn).not.toBeNull();
    expect(a.byState.find((s) => s.state === 'released')!.count).toBe(3);
  });

  it('demo report matches the scripted item and no seeded item', async () => {
    const { app } = await testApp();
    seedDatabase(app.ctx);
    const cfg = defaultMatchConfig(app.ctx.config.matchThreshold);
    const report = app.ctx.db.prepare(`SELECT * FROM lost_reports WHERE contact_email = ?`).get(DEMO_REPORT.contactEmail) as never;
    const demo = scoreMatch(report, { category: DEMO_ITEM.category, color: DEMO_ITEM.color, found_area: DEMO_ITEM.foundArea, found_at: new Date().toISOString() }, cfg);
    expect(demo.isMatch).toBe(true);
    const items = app.ctx.db.prepare(`SELECT * FROM items WHERE state IN ('found','stored')`).all() as never[];
    expect(items.filter((i) => scoreMatch(report, i, cfg).isMatch)).toEqual([]);
    // other reports don't match the demo item
    const others = app.ctx.db.prepare(`SELECT * FROM lost_reports WHERE contact_email != ?`).all(DEMO_REPORT.contactEmail) as never[];
    for (const r of others) {
      expect(scoreMatch(r, { category: 'phone', color: 'black', found_area: 'Gate 3', found_at: new Date().toISOString() }, cfg).isMatch).toBe(false);
    }
  });

  it('demo answers pass every auto-check against the demo item', async () => {
    const { app } = await testApp();
    const def = app.ctx.categories.get('phone')!;
    const challenges = buildChallenges(def, DEMO_ITEM.fields);
    expect(challenges).toHaveLength(4);
    for (const c of challenges) {
      const expected = DEMO_ITEM.fields[c.field as keyof typeof DEMO_ITEM.fields];
      const given = DEMO_ANSWERS[c.field as keyof typeof DEMO_ANSWERS];
      expect(checkAnswer(c.match, expected, given), c.field).toBe(true);
    }
  });
});
