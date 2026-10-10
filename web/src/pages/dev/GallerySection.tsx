import type { ReactNode } from 'react';

/** One titled block of the component gallery. */
export function GallerySection({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section className="gallery-section" aria-labelledby={`g-${id}`} id={id}>
      <h2 id={`g-${id}`} className="md-typescale-title-large">{title}</h2>
      {note && <p className="gallery-note">{note}</p>}
      <div className="gallery-section__body">{children}</div>
    </section>
  );
}

/** A labelled row of examples inside a section. */
export function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="gallery-specimen">
      <div className="gallery-specimen__label">{label}</div>
      <div className="gallery-specimen__body">{children}</div>
    </div>
  );
}
