import { Link } from 'react-router-dom';
import './ListItem.css';

export function List({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul role="list" className={className ? `md-list ${className}` : 'md-list'}>
      {children}
    </ul>
  );
}

export interface ListItemProps {
  headline: React.ReactNode;
  supporting?: React.ReactNode;
  overline?: React.ReactNode;
  /** Leading icon / avatar / image. Wrap an avatar in className "md-list-item__avatar" (40px circle)
   * or an image in "md-list-item__image" (56px) for the M3 sizes; a bare <Icon> works as-is. */
  leading?: React.ReactNode;
  /** Trailing meta text or icon. */
  trailing?: React.ReactNode;
  /** Renders the row as a react-router <Link>. */
  to?: string;
  onClick?: () => void;
}

/**
 * Material 3 list item. 56px (one line), 72px (two lines) or 88px (three lines: overline + supporting).
 * When `to` or `onClick` is set the whole row is the hit target with a state layer.
 */
export function ListItem({ headline, supporting, overline, leading, trailing, to, onClick }: ListItemProps) {
  const lines = 1 + (supporting ? 1 : 0) + (overline ? 1 : 0);
  const cls = `md-list-item md-list-item--lines-${lines}${to || onClick ? ' md-list-item--interactive' : ''}`;
  const body = (
    <>
      {leading && <span className="md-list-item__leading">{leading}</span>}
      <span className="md-list-item__text">
        {overline && <span className="md-list-item__overline">{overline}</span>}
        <span className="md-list-item__headline">{headline}</span>
        {supporting && <span className="md-list-item__supporting">{supporting}</span>}
      </span>
      {trailing && <span className="md-list-item__trailing">{trailing}</span>}
    </>
  );
  return (
    <li className="md-list__row">
      {to ? (
        <Link to={to} className={cls} onClick={onClick}>
          {body}
        </Link>
      ) : onClick ? (
        <button type="button" className={cls} onClick={onClick}>
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}
