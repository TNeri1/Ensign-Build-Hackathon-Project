import type { HTMLAttributes, KeyboardEvent } from 'react';
import './Card.css';

export type CardVariant = 'elevated' | 'filled' | 'outlined';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  /** Makes the whole card interactive (role="button", keyboard Enter/Space, state layer). */
  onClick?: () => void;
  as?: 'div' | 'section' | 'article';
}

/**
 * Material 3 card. elevated = surface-container-low + level1, filled = surface-container-highest,
 * outlined = surface + outline-variant border. Medium (12px) corners, 16px padding.
 * Add className "md-card--flush" to remove the padding (e.g. for edge-to-edge media).
 */
export function Card({ variant = 'elevated', className, children, onClick, as = 'div', ...rest }: CardProps) {
  const Tag = as;
  const cls = ['md-card', `md-card--${variant}`, onClick && 'md-card--interactive', className]
    .filter(Boolean)
    .join(' ');
  if (!onClick) {
    return (
      <Tag {...rest} className={cls}>
        {children}
      </Tag>
    );
  }
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <Tag {...rest} className={cls} role="button" tabIndex={0} onClick={onClick} onKeyDown={onKeyDown}>
      {children}
    </Tag>
  );
}
