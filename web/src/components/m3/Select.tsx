import { useId } from 'react';
import { Icon } from './Icon';
import type { IconName } from './icons';
import './TextField.css';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  required?: boolean;
  supportingText?: string;
  leadingIcon?: IconName;
  /** Text of the empty ("") option. When given, the label stays floated so it never overlaps it. */
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  error?: string;
}

/**
 * Material 3 outlined select: the outlined text field look over a native <select>, so the
 * platform picker (accessible, mobile-friendly) is used. Trailing expand_more icon.
 */
export function Select(props: SelectProps) {
  const {
    label, value, onChange, options, required, supportingText, leadingIcon, placeholder, id, name,
    disabled, error,
  } = props;
  const autoId = useId();
  const selectId = id ?? `sel${autoId}`;
  const supportId = `${selectId}-support`;
  const helper = error || supportingText;
  const hasValueOption = options.some((o) => o.value === value);
  // Without an empty option the browser would silently show the first option for value "".
  const showEmpty = placeholder !== undefined || !hasValueOption;
  const populated = value !== '' || Boolean(placeholder);

  const cls = [
    'md-field',
    'md-field--trailing',
    'md-select',
    populated && 'md-field--populated',
    error && 'md-field--error',
    disabled && 'md-field--disabled',
    leadingIcon && 'md-field--leading',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <div className="md-field__container">
        <fieldset className="md-field__outline" aria-hidden="true">
          <legend className="md-field__notch">
            <span>{label}{required ? ' *' : ''}</span>
          </legend>
        </fieldset>
        {leadingIcon && <Icon name={leadingIcon} className="md-field__leading-icon" />}
        <select
          id={selectId}
          name={name}
          className="md-field__input md-select__control"
          value={value}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={helper ? supportId : undefined}
          onChange={(e) => onChange(e.target.value)}
        >
          {showEmpty && <option value="">{placeholder ?? ''}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="md-field__label" htmlFor={selectId}>
          {label}
          {required && <span className="md-field__required" aria-hidden="true"> *</span>}
        </label>
        <Icon name="expand_more" className="md-field__trailing-icon md-select__arrow" />
      </div>
      {helper && (
        <div className="md-field__supporting" id={supportId}>
          {helper}
        </div>
      )}
    </div>
  );
}
