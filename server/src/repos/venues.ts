import type { Db } from '../db/connection';

/** Single-venue deployment: the public site serves the first venue. */
export function defaultVenueId(db: Db): string | undefined {
  return (db.prepare('SELECT id FROM venues ORDER BY created_at LIMIT 1').get() as { id: string } | undefined)?.id;
}
