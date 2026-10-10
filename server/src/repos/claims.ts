import type { Challenge } from '@vlf/shared';
import type { Db } from '../db/connection';
import { hashToken } from '../ids';

export type ClaimStatus = 'open' | 'submitted' | 'approved' | 'denied' | 'released';

export interface ClaimRow {
  id: string;
  item_id: string;
  report_id: string | null;
  claimant_email: string;
  status: ClaimStatus;
  challenges_json: string;
  answers_json: string | null;
  decision_reason: string | null;
  decided_by: string | null;
  created_at: string;
  submitted_at: string | null;
  decided_at: string | null;
}

const COLS = `id, item_id, report_id, claimant_email, status, challenges_json, answers_json,
              decision_reason, decided_by, created_at, submitted_at, decided_at`;

export function getClaimByToken(db: Db, token: string): ClaimRow | undefined {
  return db.prepare(`SELECT ${COLS} FROM claims WHERE token_hash = ?`).get(hashToken(token)) as ClaimRow | undefined;
}

export function getClaim(db: Db, id: string): ClaimRow | undefined {
  return db.prepare(`SELECT ${COLS} FROM claims WHERE id = ?`).get(id) as ClaimRow | undefined;
}

export const challengesOf = (c: ClaimRow): Challenge[] => JSON.parse(c.challenges_json) as Challenge[];
export const answersOf = (c: ClaimRow): Record<string, string> => (c.answers_json ? JSON.parse(c.answers_json) : {});
