import type { Db } from '../db/connection';
import type { LostReportInput } from '@vlf/shared';
import { newId, nowIso } from '../ids';

export interface ReportRow {
  id: string;
  venue_id: string;
  category: string;
  color: string;
  area: string;
  window_start: string;
  window_end: string;
  description: string;
  contact_email: string;
  created_at: string;
}

export function insertReport(db: Db, venueId: string, input: LostReportInput): string {
  const id = newId();
  db.prepare(
    `INSERT INTO lost_reports (id, venue_id, category, color, area, window_start, window_end, description, contact_email, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, venueId, input.category, input.color, input.area, input.windowStart, input.windowEnd, input.description, input.contactEmail.toLowerCase(), nowIso());
  return id;
}

export function getReport(db: Db, id: string): ReportRow | undefined {
  return db.prepare('SELECT * FROM lost_reports WHERE id = ?').get(id) as ReportRow | undefined;
}

export function listReports(db: Db, venueId: string): ReportRow[] {
  return db.prepare('SELECT * FROM lost_reports WHERE venue_id = ? ORDER BY created_at DESC').all(venueId) as ReportRow[];
}
