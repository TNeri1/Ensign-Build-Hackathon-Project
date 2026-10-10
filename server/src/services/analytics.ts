import { ITEM_STATES } from '@vlf/shared';
import type { Db } from '../db/connection';

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export interface Analytics {
  totalItems: number;
  byState: { state: string; count: number }[];
  byBin: { bin: string; label: string; count: number }[];
  claims: { submitted: number; approved: number; denied: number; released: number };
  /** Released items / all items ever logged (0-1). */
  returnRate: number;
  /** Median hours from logged to released. null when nothing has been returned. */
  medianHoursToReturn: number | null;
  topLocations: { area: string; count: number }[];
}

export function computeAnalytics(db: Db, venueId: string): Analytics {
  const stateCounts = new Map(
    (db.prepare('SELECT state, COUNT(*) AS n FROM items WHERE venue_id = ? GROUP BY state').all(venueId) as { state: string; n: number }[]).map((r) => [r.state, r.n]),
  );
  const byState = ITEM_STATES.map((state) => ({ state, count: stateCounts.get(state) ?? 0 }));
  const totalItems = byState.reduce((a, b) => a + b.count, 0);

  const byBin = db
    .prepare(
      `SELECT b.code AS bin, b.label, COUNT(i.id) AS count
         FROM storage_bins b LEFT JOIN items i ON i.bin_id = b.id AND i.state IN ('stored','claim_pending','verified')
        WHERE b.venue_id = ? GROUP BY b.id ORDER BY b.code`,
    )
    .all(venueId) as Analytics['byBin'];

  const claimCounts = new Map(
    (db
      .prepare(`SELECT c.status, COUNT(*) AS n FROM claims c JOIN items i ON i.id = c.item_id WHERE i.venue_id = ? GROUP BY c.status`)
      .all(venueId) as { status: string; n: number }[]).map((r) => [r.status, r.n]),
  );
  const n = (s: string) => claimCounts.get(s) ?? 0;
  const claims = {
    submitted: n('submitted') + n('approved') + n('denied') + n('released'),
    approved: n('approved') + n('released'),
    denied: n('denied'),
    released: n('released'),
  };

  const spans = db
    .prepare(
      `SELECT (julianday(r.at) - julianday(f.at)) * 24 AS hours
         FROM items i
         JOIN custody_events f ON f.item_id = i.id AND f.from_state IS NULL
         JOIN custody_events r ON r.item_id = i.id AND r.to_state = 'released'
        WHERE i.venue_id = ?`,
    )
    .all(venueId) as { hours: number }[];

  const topLocations = db
    .prepare('SELECT found_area AS area, COUNT(*) AS count FROM items WHERE venue_id = ? GROUP BY found_area ORDER BY count DESC, area LIMIT 10')
    .all(venueId) as Analytics['topLocations'];

  const released = stateCounts.get('released') ?? 0;
  return {
    totalItems,
    byState,
    byBin,
    claims,
    returnRate: totalItems ? released / totalItems : 0,
    medianHoursToReturn: median(spans.map((s) => s.hours)),
    topLocations,
  };
}
