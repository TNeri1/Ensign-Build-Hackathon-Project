import { useId } from 'react';
import { Icon } from '../m3/Icon';
import type { IconName } from '../m3/icons';
import './FormSection.css';

interface Props {
  icon: IconName;
  title: string;
  /** Short helper text under the title. */
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/** A titled group inside a long form (labelled region with a leading icon). */
export function FormSection({ icon, title, hint, className, children }: Props) {
  const id = useId();
  return (
    <section className={className ? `form-section ${className}` : 'form-section'} aria-labelledby={id}>
      <header className="form-section__header">
        <span className="form-section__icon">
          <Icon name={icon} size={20} />
        </span>
        <div className="form-section__titles">
          <h2 id={id} className="form-section__title">{title}</h2>
          {hint && <p className="form-section__hint">{hint}</p>}
        </div>
      </header>
      <div className="form-section__body">{children}</div>
    </section>
  );
}
