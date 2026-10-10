import type { ReactNode } from 'react';
import { NavDestinationLink, type NavDestination } from './NavigationBar';
import './NavigationRail.css';

export interface NavigationRailProps {
  destinations: NavDestination[];
  /** Optional FAB shown under the header. */
  fab?: ReactNode;
  /** Optional header (menu button / brand mark) at the top of the rail. */
  header?: ReactNode;
}

/** Material 3 navigation rail (medium + expanded windows): 80px wide, fixed to the left edge. */
export function NavigationRail({ destinations, fab, header }: NavigationRailProps) {
  return (
    <nav className="md-nav-rail" aria-label="Main">
      {header && <div className="md-nav-rail__header">{header}</div>}
      {fab && <div className="md-nav-rail__fab">{fab}</div>}
      <div className="md-nav-rail__items">
        {destinations.map((d) => (
          <NavDestinationLink key={d.to} d={d} block="md-nav-rail" />
        ))}
      </div>
    </nav>
  );
}
