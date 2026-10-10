import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The app must run with no internet (venue wifi is unreliable). Fonts, icons and colors are vendored.
 * This fails if any web source file references an external URL (CDN, Google Fonts, icon fonts, ...).
 */
const WEB = fileURLToPath(new URL('../../', import.meta.url));
const SCAN_EXT = /\.(ts|tsx|css|html)$/;
const URL_RE = /(?:https?:)?\/\/(?!localhost\b|127\.0\.0\.1\b)[a-z0-9-]+\.[a-z0-9.-]+[a-z]/gi;

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' || e.name === 'dist' ? [] : files(p);
    return SCAN_EXT.test(e.name) && !e.name.endsWith('.test.ts') ? [p] : [];
  });
}

describe('offline-first web bundle', () => {
  it('references no external URLs in web source', () => {
    const offenders: string[] = [];
    for (const f of [...files(path.join(WEB, 'src')), path.join(WEB, 'index.html')]) {
      const text = fs.readFileSync(f, 'utf8');
      for (const m of text.match(URL_RE) ?? []) offenders.push(`${path.relative(WEB, f)}: ${m}`);
    }
    expect(offenders).toEqual([]);
  });

  it('vendors the Roboto font files referenced by fonts.css', () => {
    const css = fs.readFileSync(path.join(WEB, 'src/theme/fonts.css'), 'utf8');
    const refs = [...css.matchAll(/url\('\.\/(fonts\/[^']+)'\)/g)].map((m) => m[1]);
    expect(refs.length).toBe(3);
    for (const r of refs) expect(fs.existsSync(path.join(WEB, 'src/theme', r)), r).toBe(true);
  });
});
