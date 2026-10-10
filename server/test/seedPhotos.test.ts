import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLORS } from '@vlf/shared';
import { testApp } from './helpers';
import { seedDatabase } from '../src/seed/seedAll';
import { SEED_PHOTOS } from '../src/seed/photos/catalog';
import { photoPicker } from '../src/seed/seedPhotos';

const DIR = fileURLToPath(new URL('../src/seed/photos/', import.meta.url));

describe('vendored seed photos', () => {
  it('every catalog entry is a real, small JPEG with a valid color and an attribution row', () => {
    const attribution = fs.readFileSync(path.join(DIR, 'ATTRIBUTION.md'), 'utf8');
    for (const p of SEED_PHOTOS) {
      const buf = fs.readFileSync(path.join(DIR, p.file));
      expect(buf.subarray(0, 2).toString('hex'), p.file).toBe('ffd8');
      expect(buf.length, p.file).toBeLessThan(150_000);
      expect(COLORS as readonly string[], p.file).toContain(p.color);
      expect(attribution, p.file).toContain(`\`${p.file}\``);
    }
    expect(attribution).not.toMatch(/\| CC BY|\| CC BY-SA/); // only CC0 / public domain
  });

  it('rotates deterministically and can avoid a color', () => {
    const next = photoPicker();
    const firstFive = Array.from({ length: 5 }, () => next('phone', 'black').color);
    expect(firstFive).not.toContain('black');
    const again = photoPicker();
    expect(Array.from({ length: 5 }, () => again('phone', 'black').color)).toEqual(firstFive);
  });
});

describe('seeded items use the real photos', () => {
  it('every item has a JPEG photo, its color matches a photo of that category, and recent phones are never black', async () => {
    const { app, config } = await testApp();
    seedDatabase(app.ctx);
    const items = app.ctx.db
      .prepare('SELECT category, color, photo_path, found_at FROM items')
      .all() as { category: string; color: string; photo_path: string; found_at: string }[];
    expect(items).toHaveLength(25);
    for (const i of items) {
      expect(i.photo_path).toMatch(/\.jpg$/);
      expect(fs.readFileSync(path.join(config.photoDir, i.photo_path)).subarray(0, 2).toString('hex')).toBe('ffd8');
      expect(SEED_PHOTOS.some((p) => p.category === i.category && p.color === i.color), `${i.category}/${i.color}`).toBe(true);
      const recent = Date.now() - Date.parse(i.found_at) < 2 * 86_400_000;
      if (i.category === 'phone' && recent) expect(i.color).not.toBe('black');
    }
    const apple = app.ctx.db.prepare(`SELECT COUNT(*) n FROM item_attributes WHERE key = 'brand' AND value = 'Apple'`).get() as { n: number };
    expect(apple.n).toBeGreaterThan(5); // iPhone photos -> Apple items
  });
});
