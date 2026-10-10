import { Icon } from './Icon';
import type { IconName } from './icons';
import './EmptyState.css';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  body?: string;
  action?: React.ReactNode;
}

/** Centered placeholder for empty lists and "nothing found" results. */
export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="md-empty-state">
      <span className="md-empty-state__icon">
        <Icon name={icon} size={40} />
      </span>
      <h2 className="md-empty-state__title">{title}</h2>
      {body && <p className="md-empty-state__body">{body}</p>}
      {action && <div className="md-empty-state__action">{action}</div>}
    </div>
  );
}
