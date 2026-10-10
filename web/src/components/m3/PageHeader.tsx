import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { iconButtonClassName } from './IconButton';
import './PageHeader.css';

export interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Route for a leading arrow_back icon button. */
  back?: string;
  /** Sets document.title to "<title> · Lost & Found" (WCAG 2.4.2). Default true; pass false for demos/previews. */
  documentTitle?: boolean;
}

const APP_NAME = 'Lost & Found';

/** Page title block: headline-small (headline-medium on expanded) + body-medium subtitle. */
export function PageHeader({ title, subtitle, actions, back, documentTitle = true }: PageHeaderProps) {
  useEffect(() => {
    if (documentTitle) document.title = `${title} · ${APP_NAME}`;
  }, [title, documentTitle]);
  return (
    <header className={`md-page-header${back ? ' md-page-header--with-back' : ''}`}>
      {back && (
        <Link to={back} className={iconButtonClassName('standard', undefined, 'md-page-header__back')} aria-label="Back" title="Back">
          <Icon name="arrow_back" size={24} />
        </Link>
      )}
      <div className="md-page-header__text">
        <h1 className="md-page-header__title">{title}</h1>
        {subtitle && <div className="md-page-header__subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="md-page-header__actions">{actions}</div>}
    </header>
  );
}
