import type { SessionUser } from '@vlf/shared';
import type { Db } from '../db/connection';
import { hashToken, newToken } from '../ids';

const TTL_MS = 12 * 60 * 60 * 1000;

export function createSession(db: Db, userId: string): string {
  const token = newToken();
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    hashToken(token),
    userId,
    new Date(Date.now() + TTL_MS).toISOString(),
  );
  return token;
}

export function deleteSession(db: Db, token: string): void {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
}

export function userForSession(db: Db, token: string | undefined): SessionUser | null {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, u.venue_id AS venueId
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(token), new Date().toISOString()) as SessionUser | undefined;
  return row ?? null;
}
