import { useId, type ReactNode } from 'react';
import './Checkbox.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  id?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

/**
 * Material 3 checkbox: 18px box, 40px state layer, 48px touch target, primary when checked.
 * A real <input type="checkbox"> covers the target, so keyboard, forms and screen readers work
 * natively; the whole row (box + label) is clickable.
 */
export function Checkbox({ checked, onChange, label, id, disabled, name, required }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? `cb${autoId}`;
  const cls = ['md-checkbox', checked && 'md-checkbox--checked', disabled && 'md-checkbox--disabled']
    .filter(Boolean)
    .join(' ');
  return (
    <label className={cls} htmlFor={inputId}>
      <span className="md-checkbox__target">
        <input
          id={inputId}
          type="checkbox"
          className="md-checkbox__input"
          checked={checked}
          disabled={disabled}
          name={name}
          required={required}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="md-checkbox__layer" aria-hidden="true" />
        <span className="md-checkbox__box" aria-hidden="true">
          <svg className="md-checkbox__mark" viewBox="0 0 18 18" focusable="false">
            <path d="M3.5 9.5 7.2 13.2 14.5 5.6" />
          </svg>
        </span>
      </span>
      <span className="md-checkbox__label">{label}</span>
    </label>
  );
}
