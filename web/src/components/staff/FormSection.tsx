import { useId } from 'react';
import { ShapeIcon, type ShapeName, type ShapeTone } from '../m3/ExpressiveShape';
import type { IconName } from '../m3/icons';
import './FormSection.css';

interface Props {
  icon: IconName;
  title: string;
  /** Short helper text under the title. */
  hint?: string;
  /** Expressive shape + tone behind the header icon. */
  shape?: ShapeName;
  tone?: ShapeTone;
  className?: string;
  children: React.ReactNode;
}

/** A titled group inside a long form (labelled region led by an icon in an expressive shape). */
export function FormSection({ icon, title, hint, shape = 'cookie', tone = 'secondary', className, children }: Props) {
  const id = useId();
  return (
    <section className={className ? `form-section ${className}` : 'form-section'} aria-labelledby={id}>
      <header className="form-section__header">
        <ShapeIcon icon={icon} shape={shape} tone={tone} size={44} className="form-section__icon" />
        <div className="form-section__titles">
          <h2 id={id} className="form-section__title">{title}</h2>
          {hint && <p className="form-section__hint">{hint}</p>}
        </div>
      </header>
      <div className="form-section__body">{children}</div>
    </section>
  );
}
