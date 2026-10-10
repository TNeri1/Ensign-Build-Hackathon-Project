import { useEffect, useState, type ReactNode } from 'react';
import './TopAppBar.css';

export interface TopAppBarProps {
  title: ReactNode;
  /** Usually a navigation IconButton (menu / arrow_back) or a brand mark. */
  leading?: ReactNode;
  /** Up to ~3 IconButtons / a Menu. */
  actions?: ReactNode;
  variant?: 'small' | 'center';
}

/** Scrolled past the top of the window? Used to lift the bar onto surface-container. */
function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}

/**
 * Material 3 small / center-aligned top app bar: 64px, surface color, switches to
 * surface-container once content scrolls under it. Sticky to the top of its scroll container.
 */
export function TopAppBar({ title, leading, actions, variant = 'small' }: TopAppBarProps) {
  const scrolled = useScrolled();
  const cls = ['md-top-app-bar', `md-top-app-bar--${variant}`, scrolled && 'md-top-app-bar--scrolled']
    .filter(Boolean)
    .join(' ');
  return (
    <header className={cls}>
      <div className="md-top-app-bar__leading">{leading}</div>
      <div className="md-top-app-bar__title">
        {typeof title === 'string' ? <span className="md-top-app-bar__title-text">{title}</span> : title}
      </div>
      <div className="md-top-app-bar__actions">{actions}</div>
    </header>
  );
}
