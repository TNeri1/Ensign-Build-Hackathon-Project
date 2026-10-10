import type { Db } from '../db/connection';
import { insertReport } from '../repos/reports';
import { DEMO_REPORT } from './demo';

const HOUR = 3_600_000;
const iso = (offsetHours: number) => new Date(Date.now() + offsetHours * HOUR).toISOString();

/**
 * Inserted directly (no matching run) so the Outbox starts empty for the demo.
 * Only the first one matches the scripted demo item. The others score below the threshold against it.
 */
export function seedReports(db: Db, venueId: string): string[] {
  return [
    insertReport(db, venueId, { ...DEMO_REPORT, windowStart: iso(-6), windowEnd: iso(-1) }),
    insertReport(db, venueId, {
      category: 'phone', color: 'white', area: 'Parking Lot B', description: 'White Samsung, red case',
      windowStart: iso(-30), windowEnd: iso(-26), contactEmail: 'omar.haddad@example.com',
    }),
    insertReport(db, venueId, {
      category: 'wallet', color: 'brown', area: 'Food Court', description: 'Brown leather wallet',
      windowStart: iso(-20), windowEnd: iso(-16), contactEmail: 'jules.moreau@example.com',
    }),
  ];
}
