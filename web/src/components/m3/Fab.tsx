import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import type { IconName } from './icons';
import './Fab.css';

export type FabVariant = 'primary' | 'secondary' | 'tertiary' | 'surface';

export interface FabProps {
  icon: IconName;
  /** Visible label; when given the FAB becomes an extended FAB. */
  label?: string;
  /** Accessible name for an icon-only FAB (defaults to the humanized icon name). */
  ariaLabel?: string;
  /** Renders a react-router <Link> instead of a <button>. */
  to?: string;
  onClick?: () => void;
  variant?: FabVariant;
  className?: string;
}

/** Material 3 FAB / extended FAB: 56px, large (16px) corners, level3 elevation (level4 on hover). */
export function Fab({ icon, label, ariaLabel, to, onClick, variant = 'primary', className }: FabProps) {
  const cls = ['md-fab', `md-fab--${variant}`, label && 'md-fab--extended', className].filter(Boolean).join(' ');
  const name = label ? undefined : (ariaLabel ?? icon.replace(/_/g, ' '));
  const content = (
    <>
      <Icon name={icon} size={24} />
      {label && <span className="md-fab__label">{label}</span>}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} aria-label={name} title={name} onClick={onClick}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} aria-label={name} title={name} onClick={onClick}>
      {content}
    </button>
  );
}
