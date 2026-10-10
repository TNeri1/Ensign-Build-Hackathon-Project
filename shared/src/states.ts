/** Item lifecycle. This file is the ONLY place allowed transitions are defined. */
export const ITEM_STATES = ['found', 'stored', 'claim_pending', 'verified', 'released', 'disposed'] as const;
export type ItemState = (typeof ITEM_STATES)[number];

export const TRANSITIONS: Readonly<Record<ItemState, readonly ItemState[]>> = {
  found: ['stored', 'disposed'],
  stored: ['claim_pending', 'disposed'],
  claim_pending: ['verified', 'stored'], // 'stored' = claim denied or abandoned
  verified: ['released', 'stored'], // 'stored' = pickup window expired
  released: [],
  disposed: [],
};

export function isItemState(s: string): s is ItemState {
  return (ITEM_STATES as readonly string[]).includes(s);
}

export function canTransition(from: ItemState, to: ItemState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isTerminal(state: ItemState): boolean {
  return TRANSITIONS[state].length === 0;
}

export class InvalidTransitionError extends Error {
  constructor(
    public from: ItemState,
    public to: ItemState,
  ) {
    super(`Invalid item transition: ${from} -> ${to}`);
  }
}

export function assertTransition(from: ItemState, to: ItemState): void {
  if (!canTransition(from, to)) throw new InvalidTransitionError(from, to);
}
