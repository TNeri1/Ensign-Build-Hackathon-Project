import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import type { IconName } from './icons';
import './NavigationBar.css';

export interface NavDestination {
  to: string;
  label: string;
  icon: IconName;
  /** Only active on an exact match (e.g. '/' or '/staff'). */
  end?: boolean;
}

export interface NavigationBarProps {
  destinations: NavDestination[];
}

/** One destination: active-indicator pill around the icon (filled when active) + label. Shared with the rail. */
export function NavDestinationLink({ d, block }: { d: NavDestination; block: 'md-nav-bar' | 'md-nav-rail' }) {
  return (
    <NavLink to={d.to} end={d.end} className={({ isActive }) => `${block}__item${isActive ? ' is-active' : ''}`}>
      {({ isActive }) => (
        <>
          <span className={`${block}__indicator`}>
            <Icon name={d.icon} size={24} filled={isActive} />
          </span>
          <span className={`${block}__label`}>{d.label}</span>
        </>
      )}
    </NavLink>
  );
}

/** Material 3 navigation bar (compact windows): 80px, surface-container, 3-5 destinations. */
export function NavigationBar({ destinations }: NavigationBarProps) {
  return (
    <nav className="md-nav-bar" aria-label="Main">
      {destinations.map((d) => (
        <NavDestinationLink key={d.to} d={d} block="md-nav-bar" />
      ))}
    </nav>
  );
}
