import { useId, useState, type ChangeEvent, type HTMLAttributes } from 'react';
import { Icon } from './Icon';
import type { IconName } from './icons';
import './TextField.css';

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  supportingText?: string;
  /** Error message: puts the field in the error state and replaces the supporting text. */
  error?: string;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  multiline?: boolean;
  rows?: number;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  name?: string;
  id?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  disabled?: boolean;
  onTrailingIconClick?: () => void;
  trailingIconLabel?: string;
  /** type="file" only: accepted types, e.g. "image/*". */
  accept?: string;
  /** type="file" only: camera hint for mobile, e.g. "environment". */
  capture?: 'user' | 'environment';
  /** type="file" only: receives the selected files (the input is uncontrolled for files). */
  onFiles?: (files: FileList | null) => void;
}

/** Native input types that always render something (a mask or a button), so the label must stay floated. */
const ALWAYS_FLOATED = new Set(['date', 'datetime-local', 'time', 'month', 'week', 'file', 'color', 'range']);

/**
 * Material 3 outlined text field. The label rests inside the field and floats into a notch in the
 * outline when the field is focused or filled. A native <input>/<textarea> sits underneath so
 * mobile keyboards, pickers and autofill behave natively.
 */
export function TextField(props: TextFieldProps) {
  const {
    label, value, onChange, type = 'text', required, placeholder, supportingText, error,
    leadingIcon, trailingIcon, multiline, rows = 3, inputMode, autoComplete, name, id, min, max,
    step, disabled, onTrailingIconClick, trailingIconLabel, accept, capture, onFiles,
  } = props;
  const autoId = useId();
  const inputId = id ?? `tf${autoId}`;
  const supportId = `${inputId}-support`;
  const [revealed, setRevealed] = useState(false);

  const isFile = type === 'file';
  const isPassword = type === 'password' && !multiline;
  const effectiveType = isPassword && revealed ? 'text' : type;
  const populated = value !== '' || (!multiline && ALWAYS_FLOATED.has(type));
  const helper = error || supportingText;

  // Password fields get a show/hide toggle unless the caller supplied its own trailing icon.
  const trailing: IconName | undefined = trailingIcon ?? (isPassword ? (revealed ? 'visibility_off' : 'visibility') : undefined);
  const trailingClick = onTrailingIconClick ?? (isPassword && !trailingIcon ? () => setRevealed((r) => !r) : undefined);
  const trailingLabel = trailingIconLabel ?? (isPassword && !trailingIcon ? (revealed ? 'Hide password' : 'Show password') : label);
  const showErrorIcon = Boolean(error) && !trailing;

  const cls = [
    'md-field',
    populated && 'md-field--populated',
    error && 'md-field--error',
    disabled && 'md-field--disabled',
    leadingIcon && 'md-field--leading',
    (trailing || showErrorIcon) && 'md-field--trailing',
    multiline && 'md-field--multiline',
  ].filter(Boolean).join(' ');

  const common = {
    id: inputId,
    className: 'md-field__input',
    name,
    required,
    disabled,
    placeholder,
    autoComplete,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': helper ? supportId : undefined,
  } as const;

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value);

  let control;
  if (multiline) {
    control = <textarea {...common} rows={rows} value={value} onChange={handle} />;
  } else if (isFile) {
    control = (
      <input
        {...common}
        type="file"
        accept={accept}
        capture={capture}
        onChange={(e) => {
          onChange(e.target.value);
          onFiles?.(e.target.files);
        }}
      />
    );
  } else {
    control = (
      <input
        {...common}
        type={effectiveType}
        value={value}
        onChange={handle}
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
      />
    );
  }

  return (
    <div className={cls}>
      <div className="md-field__container">
        <fieldset className="md-field__outline" aria-hidden="true">
          <legend className="md-field__notch">
            <span>{label}{required ? ' *' : ''}</span>
          </legend>
        </fieldset>
        {leadingIcon && <Icon name={leadingIcon} className="md-field__leading-icon" />}
        {control}
        <label className="md-field__label" htmlFor={inputId}>
          {label}
          {required && <span className="md-field__required" aria-hidden="true"> *</span>}
        </label>
        {trailing && trailingClick && (
          <button
            type="button"
            className="md-field__icon-button"
            onClick={trailingClick}
            aria-label={trailingLabel}
            title={trailingLabel}
            aria-pressed={isPassword && !trailingIcon ? revealed : undefined}
            disabled={disabled}
          >
            <Icon name={trailing} />
          </button>
        )}
        {trailing && !trailingClick && <Icon name={trailing} className="md-field__trailing-icon" />}
        {showErrorIcon && <Icon name="error" className="md-field__trailing-icon" />}
      </div>
      {helper && (
        <div className="md-field__supporting" id={supportId} aria-live={error ? 'polite' : undefined}>
          {helper}
        </div>
      )}
    </div>
  );
}
