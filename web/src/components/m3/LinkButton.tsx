import { Link } from 'react-router-dom';
import { buttonClassName, ButtonContent, type ButtonSize, type ButtonVariant } from './Button';
import type { IconName } from './icons';
import './Button.css';

export interface LinkButtonProps {
  to: string;
  variant?: ButtonVariant;
  icon?: IconName;
  trailingIcon?: IconName;
  full?: boolean;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

/** A react-router <Link> styled exactly like <Button> (navigation, not an action). */
export function LinkButton({ to, variant, icon, trailingIcon, full, size, className, children }: LinkButtonProps) {
  return (
    <Link to={to} className={buttonClassName({ variant, size, full, icon, trailingIcon }, className)}>
      <ButtonContent icon={icon} trailingIcon={trailingIcon} size={size}>
        {children}
      </ButtonContent>
    </Link>
  );
}
