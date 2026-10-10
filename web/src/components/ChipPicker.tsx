import { ChoiceChips } from './m3/Chips';
import type { IconName } from './m3/icons';

interface Props<T extends string> {
  options: readonly { value: T; label: string; icon?: IconName }[];
  value: T | '';
  onChange(v: T): void;
  /** Accessible name of the chip group. */
  ariaLabel?: string;
  /** Optional CSS color for a small leading dot. */
  swatch?: (v: T) => string | undefined;
}

/** Thin compatibility wrapper over m3 ChoiceChips (prefer ChoiceChips in new code). */
export function ChipPicker<T extends string>({ options, value, onChange, ariaLabel = 'Options', swatch }: Props<T>) {
  return <ChoiceChips options={options} value={value} onChange={onChange} ariaLabel={ariaLabel} swatch={swatch} />;
}
