import type { Db } from '../db/connection';
import { nowIso } from '../ids';

export interface Notification {
  channel: 'email' | 'sms';
  to: string;
  subject: string;
  body: string;
}

/**
 * Dev "sender": no email/SMS provider is called. Every message is stored and shown on the Outbox page.
 * To add a real provider later, branch here.
 */
export function sendNotification(db: Db, n: Notification): void {
  db.prepare('INSERT INTO notifications (channel, to_addr, subject, body, created_at) VALUES (?, ?, ?, ?, ?)').run(
    n.channel, n.to, n.subject, n.body, nowIso(),
  );
}

export function listNotifications(db: Db, limit = 100) {
  return db
    .prepare('SELECT id, channel, to_addr AS "to", subject, body, created_at AS createdAt FROM notifications ORDER BY id DESC LIMIT ?')
    .all(limit);
}
