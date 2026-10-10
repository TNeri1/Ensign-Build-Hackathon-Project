import { Icon } from './Icon';
import type { IconName } from './icons';
import { useRovingRadio } from './rovingRadio';
import './SegmentedButton.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

export interface SegmentedButtonProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}

/**
 * Material 3 single-select segmented button (2-5 segments). Radio semantics with roving focus;
 * the selected segment uses secondary-container and swaps its icon for a check.
 */
export function SegmentedButton<T extends string>({ options, value, onChange, ariaLabel }: SegmentedButtonProps<T>) {
  const roving = useRovingRadio(
    options.map((o) => o.value),
    value,
    onChange,
  );
  return (
    <div className="md-segmented" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o, i) => {
        const selected = o.value === value;
        const lead: IconName | undefined = selected ? 'check' : o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`md-segmented__segment${selected ? ' md-segmented__segment--selected' : ''}`}
            onClick={() => onChange(o.value)}
            {...roving.itemProps(i)}
          >
            {lead && <Icon name={lead} size={18} className="md-segmented__icon" />}
            <span className="md-segmented__label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
