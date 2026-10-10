import { useRef, type KeyboardEvent } from 'react';

/**
 * Roving-tabindex keyboard model for single-select groups rendered as role="radiogroup" with
 * role="radio" children (ChoiceChips, SegmentedButton). Only the checked item (or the first, if
 * none is checked) is in the tab order; arrow keys / Home / End move focus AND select, like
 * native radio buttons.
 */
export function useRovingRadio<T extends string>(values: readonly T[], value: T | '', onChange: (v: T) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIndex = values.indexOf(value as T);
  const tabStop = checkedIndex >= 0 ? checkedIndex : 0;

  function select(index: number) {
    const n = values.length;
    if (n === 0) return;
    const i = ((index % n) + n) % n;
    refs.current[i]?.focus();
    const next = values[i];
    if (next !== undefined && next !== value) onChange(next);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    switch (e.key) {
      case 'ArrowRight':
        select(rtl ? index - 1 : index + 1);
        break;
      case 'ArrowDown':
        select(index + 1);
        break;
      case 'ArrowLeft':
        select(rtl ? index + 1 : index - 1);
        break;
      case 'ArrowUp':
        select(index - 1);
        break;
      case 'Home':
        select(0);
        break;
      case 'End':
        select(values.length - 1);
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  return {
    /** Props to spread on item `index`. */
    itemProps(index: number) {
      return {
        ref: (el: HTMLButtonElement | null) => {
          refs.current[index] = el;
        },
        tabIndex: index === tabStop ? 0 : -1,
        onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => onKeyDown(e, index),
      };
    },
  };
}
