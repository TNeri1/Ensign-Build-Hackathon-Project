import { describe, it, expect } from 'vitest';
import { testDb } from './helpers';
import { makeVenue, makeBin, makeItem } from './fixtures';
import { transitionItem, listCustody } from '../src/services/custody';
import { getItem } from '../src/repos/items';
import { InvalidTransitionError } from '@vlf/shared';

const staff = { userId: null, label: 'Sam (staff)' };

describe('transitionItem', () => {
  it('moves state, updates bin and writes a custody event', () => {
    const db = testDb();
    const v = makeVenue(db);
    const bin = makeBin(db, v);
    const id = makeItem(db, v);
    transitionItem(db, id, 'stored', staff, 'shelved', { binId: bin });
    expect(getItem(db, id)).toMatchObject({ state: 'stored', bin_id: bin });
    const events = listCustody(db, id);
    expect(events.map((e) => [e.from_state, e.to_state])).toEqual([[null, 'found'], ['found', 'stored']]);
    expect(events[1]).toMatchObject({ actor_label: 'Sam (staff)', note: 'shelved' });
  });

  it('rejects invalid transitions without changing anything', () => {
    const db = testDb();
    const id = makeItem(db, makeVenue(db));
    expect(() => transitionItem(db, id, 'released', staff)).toThrow(InvalidTransitionError);
    expect(getItem(db, id)?.state).toBe('found');
    expect(listCustody(db, id)).toHaveLength(1);
  });

  it('throws 404 for unknown items', () => {
    expect(() => transitionItem(testDb(), 'nope', 'stored', staff)).toThrow(/not found/i);
  });
});
