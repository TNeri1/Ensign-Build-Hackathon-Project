import { Icon } from './Icon';
import type { IconName } from './icons';
import './Alert.css';

export type AlertKind = 'info' | 'success' | 'warning' | 'error';

const ICON: Record<AlertKind, IconName> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

export interface AlertProps {
  kind?: AlertKind;
  title?: string;
  children: React.ReactNode;
  /** Optional action, typically a text <Button>. */
  action?: React.ReactNode;
}

/** Inline banner in the matching container colors. Errors interrupt (role="alert"); others are polite (role="status"). */
export function Alert({ kind = 'info', title, children, action }: AlertProps) {
  return (
    <div className={`md-alert md-alert--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <Icon name={ICON[kind]} size={24} className="md-alert__icon" />
      <div className="md-alert__content">
        {title && <div className="md-alert__title">{title}</div>}
        <div className="md-alert__body">{children}</div>
      </div>
      {action && <div className="md-alert__action">{action}</div>}
    </div>
  );
}
