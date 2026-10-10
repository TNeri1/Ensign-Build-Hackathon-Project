import type { SessionUser } from '@vlf/shared';
import type { IconName } from './m3/icons';
import type { NavDestination } from './m3/NavigationBar';

export interface OverflowItem {
  label: string;
  icon: IconName;
  to?: string;
  /** Special actions handled by the layout (not a route). */
  action?: 'logout';
}

export interface Destinations {
  /** Shown in the navigation bar (compact) / rail (medium+). Never more than 5 (M3 limit). */
  primary: NavDestination[];
  /** Shown in the top app bar overflow menu. */
  overflow: OverflowItem[];
  /**
   * The role's primary action, shown as the rail FAB on medium/expanded windows. Only set when the
   * action is not already a primary destination (a FAB duplicating a rail item adds no value).
   */
  railFab?: { label: string; icon: IconName; to: string };
}

export const MAX_PRIMARY = 5;

const D = {
  home: { to: '/', label: 'Home', icon: 'home', end: true },
  search: { to: '/search', label: 'Search', icon: 'travel_explore' },
  report: { to: '/report', label: 'Report lost', icon: 'campaign' },
  outbox: { to: '/outbox', label: 'Outbox', icon: 'inbox' },
  dashboard: { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  inventory: { to: '/staff', label: 'Inventory', icon: 'inventory_2', end: true },
  claims: { to: '/staff/claims', label: 'Claims', icon: 'assignment' },
  pickup: { to: '/staff/pickup', label: 'Pickup', icon: 'qr_code_scanner' },
  reports: { to: '/staff/reports', label: 'Lost reports', icon: 'campaign' },
} satisfies Record<string, NavDestination>;

const O = {
  login: { label: 'Staff login', icon: 'login', to: '/login' },
  intake: { label: 'Log item', icon: 'add', to: '/staff/intake' },
  bins: { label: 'Bins & labels', icon: 'warehouse', to: '/staff/bins' },
  publicSearch: { label: 'Public search', icon: 'search', to: '/search' },
  retention: { label: 'Retention', icon: 'delete_sweep', to: '/admin/retention' },
  outbox: { label: 'Outbox', icon: 'inbox', to: '/outbox' },
  logout: { label: 'Log out', icon: 'logout', action: 'logout' },
} satisfies Record<string, OverflowItem>;

/** Navigation destinations for the current session (logged out, staff or admin). Pure. */
export function destinations(user: SessionUser | null): Destinations {
  let result: Destinations;
  if (!user) {
    result = { primary: [D.home, D.search, D.report, D.outbox], overflow: [O.login] };
  } else if (user.role === 'admin') {
    result = {
      primary: [D.dashboard, D.inventory, D.claims, D.pickup, D.reports],
      overflow: [O.retention, O.outbox, O.intake, O.bins, O.publicSearch, O.logout],
    };
  } else {
    result = {
      primary: [D.inventory, D.claims, D.pickup, D.reports, D.outbox],
      overflow: [O.intake, O.bins, O.publicSearch, O.logout],
    };
  }
  // Staff + admin: "Log item" lives in overflow on compact, so the rail surfaces it as its FAB.
  // Public: "Report lost" is already a rail destination, so no FAB.
  const railFab = user ? { label: O.intake.label, icon: O.intake.icon, to: O.intake.to } : undefined;
  return { primary: result.primary.slice(0, MAX_PRIMARY), overflow: result.overflow, railFab };
}
