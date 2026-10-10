import { describe, it, expect } from 'vitest';
import { ITEM_STATES, canTransition, assertTransition, isTerminal, InvalidTransitionError } from './states';

describe('item state machine', () => {
  it('allows the happy path', () => {
    const path = ['found', 'stored', 'claim_pending', 'verified', 'released'] as const;
    for (let i = 0; i < path.length - 1; i++) expect(canTransition(path[i], path[i + 1])).toBe(true);
  });

  it('allows deny/expiry back to stored and disposal from found/stored', () => {
    expect(canTransition('claim_pending', 'stored')).toBe(true);
    expect(canTransition('verified', 'stored')).toBe(true);
    expect(canTransition('found', 'disposed')).toBe(true);
    expect(canTransition('stored', 'disposed')).toBe(true);
  });

  it('rejects skipping states and disposing items mid-claim', () => {
    expect(canTransition('found', 'released')).toBe(false);
    expect(canTransition('stored', 'verified')).toBe(false);
    expect(canTransition('claim_pending', 'disposed')).toBe(false);
    expect(canTransition('verified', 'disposed')).toBe(false);
  });

  it('treats released and disposed as terminal', () => {
    expect(isTerminal('released')).toBe(true);
    expect(isTerminal('disposed')).toBe(true);
    for (const to of ITEM_STATES) {
      expect(canTransition('released', to)).toBe(false);
      expect(canTransition('disposed', to)).toBe(false);
    }
  });

  it('never allows a self-transition', () => {
    for (const s of ITEM_STATES) expect(canTransition(s, s)).toBe(false);
  });

  it('assertTransition throws a typed error', () => {
    expect(() => assertTransition('found', 'released')).toThrow(InvalidTransitionError);
  });
});
