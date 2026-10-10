import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';
import type { IconName } from './icons';
import './IconButton.css';

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label' | 'title'> {
  icon: IconName;
  /** Required: used as aria-label and tooltip (title). */
  label: string;
  variant?: IconButtonVariant;
  /** Set (true/false) to make this a toggle button (aria-pressed); leave undefined for a plain action. */
  selected?: boolean;
}

/** Shared with PageHeader's back link so links and buttons look the same. */
export function iconButtonClassName(variant: IconButtonVariant = 'standard', selected?: boolean, extra?: string) {
  return [
    'md-icon-button',
    `md-icon-button--${variant}`,
    selected === true && 'md-icon-button--selected',
    selected === false && 'md-icon-button--unselected',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Material 3 icon button: 40px visual, 48px touch target. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = 'standard', selected, type = 'button', className, ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={selected === undefined ? undefined : selected}
      className={iconButtonClassName(variant, selected, className)}
    >
      <Icon name={icon} size={24} filled={selected === true} />
    </button>
  );
});
