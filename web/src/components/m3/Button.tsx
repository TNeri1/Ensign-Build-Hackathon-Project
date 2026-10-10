import type { ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';
import type { IconName } from './icons';
import './Button.css';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
export type ButtonSize = 'medium' | 'large';

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: IconName;
  trailingIcon?: IconName;
}

/** Shared by Button and LinkButton so both render identically. */
export function buttonClassName(
  { variant = 'filled', size = 'medium', full = false, icon, trailingIcon }: ButtonStyleProps,
  extra?: string,
): string {
  return [
    'md-button',
    `md-button--${variant}`,
    size === 'large' && 'md-button--large',
    full && 'md-button--full',
    icon && 'md-button--has-icon',
    trailingIcon && 'md-button--has-trailing-icon',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Inner content (icon + label + trailing icon) shared by Button and LinkButton. */
export function ButtonContent({
  icon,
  trailingIcon,
  size = 'medium',
  children,
}: Pick<ButtonStyleProps, 'icon' | 'trailingIcon' | 'size'> & { children?: React.ReactNode }) {
  const iconSize = size === 'large' ? 24 : 18;
  return (
    <>
      {icon && <Icon name={icon} size={iconSize} className="md-button__icon" />}
      <span className="md-button__label">{children}</span>
      {trailingIcon && <Icon name={trailingIcon} size={iconSize} className="md-button__icon" />}
    </>
  );
}

export type ButtonProps = ButtonStyleProps & ButtonHTMLAttributes<HTMLButtonElement>;

/** Material 3 common button. 40px tall (56px when size="large"), full-radius, label-large. */
export function Button({
  variant,
  size,
  full,
  icon,
  trailingIcon,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={buttonClassName({ variant, size, full, icon, trailingIcon }, className)}
    >
      <ButtonContent icon={icon} trailingIcon={trailingIcon} size={size}>
        {children}
      </ButtonContent>
    </button>
  );
}
