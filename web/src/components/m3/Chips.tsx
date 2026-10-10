import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { useRovingRadio } from './rovingRadio';
import './Chips.css';

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: IconName;
  disabled?: boolean;
}

/** M3 filter chip: toggle button. Selected => secondary-container with a leading check. */
export function FilterChip({ label, selected, onClick, icon, disabled }: FilterChipProps) {
  const lead: IconName | undefined = selected ? 'check' : icon;
  return (
    <button
      type="button"
      className={chipClass(selected, Boolean(lead))}
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
    >
      {lead && <Icon name={lead} size={18} className="md-chip__icon" />}
      <span className="md-chip__label">{label}</span>
    </button>
  );
}

export interface ChoiceChipOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

export interface ChoiceChipsProps<T extends string> {
  options: readonly ChoiceChipOption<T>[];
  value: T | '';
  onChange: (v: T) => void;
  ariaLabel: string;
  /** Optional CSS color for a small leading dot (e.g. item colors). */
  swatch?: (v: T) => string | undefined;
}

/**
 * Single-select chip set (radio semantics): role="radiogroup" of role="radio" filter-style chips
 * with roving focus (arrow keys / Home / End move and select, Tab leaves the group).
 */
export function ChoiceChips<T extends string>({ options, value, onChange, ariaLabel, swatch }: ChoiceChipsProps<T>) {
  const values = options.map((o) => o.value);
  const roving = useRovingRadio(values, value, onChange);
  return (
    <div className="md-chip-set" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o, i) => {
        const selected = o.value === value;
        const color = swatch?.(o.value);
        const lead: IconName | undefined = selected ? 'check' : o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={chipClass(selected, Boolean(lead) || Boolean(color))}
            onClick={() => onChange(o.value)}
            {...roving.itemProps(i)}
          >
            {lead && <Icon name={lead} size={18} className="md-chip__icon" />}
            {color && <span className="md-chip__swatch" style={{ background: color }} aria-hidden="true" />}
            <span className="md-chip__label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export interface AssistChipProps {
  label: string;
  icon?: IconName;
  onClick?: () => void;
  to?: string;
}

/** M3 assist chip: a smart shortcut action. Renders a router <Link> when `to` is given. */
export function AssistChip({ label, icon, onClick, to }: AssistChipProps) {
  const cls = `md-chip md-chip--assist${icon ? ' md-chip--with-icon' : ''}`;
  const content = (
    <>
      {icon && <Icon name={icon} size={18} className="md-chip__icon" />}
      <span className="md-chip__label">{label}</span>
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {content}
    </button>
  );
}

function chipClass(selected: boolean, withIcon: boolean): string {
  return ['md-chip', 'md-chip--filter', selected && 'md-chip--selected', withIcon && 'md-chip--with-icon']
    .filter(Boolean)
    .join(' ');
}
