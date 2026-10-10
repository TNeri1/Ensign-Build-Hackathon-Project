import { assertTransition, type ItemState } from '@vlf/shared';
import type { Db } from '../db/connection';
import { nowIso } from '../ids';
import { notFound } from '../errors';
import { getItem } from '../repos/items';

export interface Actor {
  userId: string | null;
  /** Human-readable, e.g. a staff name or "claimant". Always recorded. */
  label: string;
}

export interface CustodyEvent {
  id: number;
  item_id: string;
  actor_user_id: string | null;
  actor_label: string;
  at: string;
  from_state: ItemState | null;
  to_state: ItemState;
  note: string;
}

/**
 * The ONLY function that changes items.state.
 * Validates the transition, updates the item and appends a custody event atomically.
 */
export function transitionItem(
  db: Db,
  itemId: string,
  to: ItemState,
  actor: Actor,
  note = '',
  extra: { binId?: string | null } = {},
): void {
  db.transaction(() => {
    const item = getItem(db, itemId);
    if (!item) throw notFound('Item not found');
    assertTransition(item.state, to);
    const at = nowIso();
    const binId = extra.binId !== undefined ? extra.binId : item.bin_id;
    db.prepare('UPDATE items SET state = ?, bin_id = ?, updated_at = ? WHERE id = ?').run(to, binId, at, itemId);
    recordEvent(db, itemId, item.state, to, actor, note, at);
  })();
}

/** Record the creation event (null -> state). Called once when an item is first inserted. */
export function recordCreation(db: Db, itemId: string, state: ItemState, actor: Actor, note = ''): void {
  recordEvent(db, itemId, null, state, actor, note, nowIso());
}

function recordEvent(
  db: Db,
  itemId: string,
  from: ItemState | null,
  to: ItemState,
  actor: Actor,
  note: string,
  at: string,
): void {
  db.prepare(
    `INSERT INTO custody_events (item_id, actor_user_id, actor_label, at, from_state, to_state, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(itemId, actor.userId, actor.label, at, from, to, note);
}

export function listCustody(db: Db, itemId: string): CustodyEvent[] {
  return db.prepare('SELECT * FROM custody_events WHERE item_id = ? ORDER BY id').all(itemId) as CustodyEvent[];
}
