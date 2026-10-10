import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Icon } from './m3/Icon';
import { Fab } from './m3/Fab';
import { Menu, type MenuItem } from './m3/Menu';
import { NavigationBar } from './m3/NavigationBar';
import { NavigationRail } from './m3/NavigationRail';
import { useSnackbar } from './m3/Snackbar';
import { TopAppBar } from './m3/TopAppBar';
import { destinations } from './nav';
import { ThemeToggle } from './ThemeToggle';
import './Layout.css';

/** Decorative rail header: a plain icon, not a container, so it is never mistaken for the rail FAB. */
function BrandMark() {
  return <Icon name="backpack" size={24} className="app-brand-mark" />;
}

/**
 * Route change management (WCAG 2.4.3 Focus Order): when the path changes, scroll to the top and move
 * focus to <main> so keyboard / screen reader users start at the new page, not on a stale link.
 * Skipped on the first render (initial page load keeps the browser's default focus) and for
 * search/hash-only changes (filters that sync to ?q= must not steal focus from their input;
 * #anchors scroll themselves).
 */
function useRouteFocus(mainRef: React.RefObject<HTMLElement | null>) {
  const { pathname } = useLocation();
  const last = useRef(pathname); // compares paths, so StrictMode's double effect run is a no-op
  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); // html has scroll-behavior: smooth
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, mainRef]);
}

/**
 * App shell. Both navigation components are always rendered and CSS picks one (no resize jank):
 * - compact (< 600px): top app bar + content + bottom NavigationBar
 * - medium / expanded (>= 600px): NavigationRail on the left, top app bar + content to its right
 */
export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const mainRef = useRef<HTMLElement>(null);
  useRouteFocus(mainRef);
  const { primary, overflow, railFab } = destinations(user);

  const menuItems: MenuItem[] = overflow.map((o) =>
    o.action === 'logout'
      ? {
          label: o.label,
          icon: o.icon,
          onClick: () => {
            void logout().then(
              () => {
                navigate('/');
                snackbar.show('Logged out');
              },
              () => snackbar.show('Could not log out. Try again.', { kind: 'error' }),
            );
          },
        }
      : { label: o.label, icon: o.icon, to: o.to },
  );

  const subtitle = user ? (user.role === 'admin' ? 'Admin' : 'Staff') : null;

  return (
    <div className="app-shell">
      <a className="md-skip-link" href="#main">Skip to content</a>
      <NavigationRail
        destinations={primary}
        header={<BrandMark />}
        fab={railFab && <Fab icon={railFab.icon} ariaLabel={railFab.label} to={railFab.to} />}
      />
      <div className="app-body">
        <TopAppBar
          title={
            <Link to="/" className="app-title">
              <span className="app-title__text">Lost &amp; Found</span>
              {subtitle && <span className="app-title__role">{subtitle}</span>}
            </Link>
          }
          actions={
            <>
              <ThemeToggle />
              <Menu anchorLabel="More options" items={menuItems} />
            </>
          }
        />
        <main id="main" ref={mainRef} className="app-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <NavigationBar destinations={primary} />
    </div>
  );
}
