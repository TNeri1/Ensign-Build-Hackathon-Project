import { useEffect, type ReactNode } from 'react';
import { ShapeIcon, shapePath, type ShapeName } from './ExpressiveShape';
import type { IconName } from './icons';
import './HeroHeader.css';

interface Props {
  title: string;
  subtitle?: ReactNode;
  /** Icon shown in an expressive shape beside the title. */
  icon?: IconName;
  shape?: ShapeName;
  /** Buttons / chips under the subtitle. */
  actions?: ReactNode;
  /** Optional extra content inside the banner (e.g. a search field). */
  children?: ReactNode;
  /** Sets document.title (default true), like PageHeader. */
  documentTitle?: boolean;
}

/**
 * M3 Expressive page banner: tinted gradient container, big emphasized title, a large decorative shape.
 * Use for key pages (home, search, inventory); PageHeader stays the default for the rest.
 */
export function HeroHeader({ title, subtitle, icon, shape = 'cookie', actions, children, documentTitle = true }: Props) {
  useEffect(() => {
    if (documentTitle) document.title = `${title} · Lost & Found`;
  }, [title, documentTitle]);
  return (
    <header className="md-hero md-rise">
      <svg className="md-hero__decor md-hero__decor--a" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d={shapePath('sunny')} /></svg>
      <svg className="md-hero__decor md-hero__decor--b" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d={shapePath('clover')} /></svg>
      <div className="md-hero__content">
        {icon && <ShapeIcon icon={icon} shape={shape} tone="surface" size={56} className="md-hero__icon" />}
        <h1 className="md-hero__title">{title}</h1>
        {subtitle && <p className="md-hero__subtitle">{subtitle}</p>}
        {actions && <div className="md-hero__actions">{actions}</div>}
        {children}
      </div>
    </header>
  );
}
