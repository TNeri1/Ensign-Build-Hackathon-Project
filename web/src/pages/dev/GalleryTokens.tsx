import { GallerySection } from './GallerySection';

const TYPESCALE = [
  'display-small',
  'headline-large', 'headline-medium', 'headline-small',
  'title-large', 'title-medium', 'title-small',
  'body-large', 'body-medium', 'body-small',
  'label-large', 'label-medium', 'label-small',
];

/** [container role, content role] pairs; each swatch shows its content color on the container. */
const COLOR_PAIRS: [string, string][] = [
  ['primary', 'on-primary'], ['primary-container', 'on-primary-container'],
  ['secondary', 'on-secondary'], ['secondary-container', 'on-secondary-container'],
  ['tertiary', 'on-tertiary'], ['tertiary-container', 'on-tertiary-container'],
  ['error', 'on-error'], ['error-container', 'on-error-container'],
  ['warning', 'on-warning'], ['warning-container', 'on-warning-container'],
  ['success', 'on-success'], ['success-container', 'on-success-container'],
  ['surface', 'on-surface'], ['surface-variant', 'on-surface-variant'],
  ['surface-dim', 'on-surface'], ['surface-bright', 'on-surface'],
  ['surface-container-lowest', 'on-surface'], ['surface-container-low', 'on-surface'],
  ['surface-container', 'on-surface'], ['surface-container-high', 'on-surface'],
  ['surface-container-highest', 'on-surface'], ['inverse-surface', 'inverse-on-surface'],
  ['inverse-primary', 'on-primary-container'], ['outline', 'surface'], ['outline-variant', 'on-surface'],
  ['background', 'on-background'],
];

const SHAPES = ['none', 'extra-small', 'small', 'medium', 'large', 'extra-large', 'full'];

export function TypescaleGallery() {
  return (
    <GallerySection id="typescale" title="Typescale" note="Utility classes .md-typescale-<role>; vars --md-sys-typescale-<role>-size / -line-height / -weight / -tracking.">
      <div className="gallery-type">
        {TYPESCALE.map((r) => (
          <div key={r} className="gallery-type__row">
            <code className="gallery-type__name">{r}</code>
            <span className={`md-typescale-${r}`}>Lost &amp; Found</span>
          </div>
        ))}
      </div>
    </GallerySection>
  );
}

export function ColorGallery() {
  return (
    <GallerySection id="colors" title="Color roles" note="--md-sys-color-<role>. Toggle the theme in the top app bar to check dark mode.">
      <div className="gallery-colors">
        {COLOR_PAIRS.map(([bg, fg]) => (
          <div
            key={bg}
            className="gallery-color"
            style={{ background: `var(--md-sys-color-${bg})`, color: `var(--md-sys-color-${fg})` }}
          >
            <span className="md-typescale-label-large">{bg}</span>
            <span className="md-typescale-label-small">on: {fg}</span>
          </div>
        ))}
      </div>
    </GallerySection>
  );
}

export function ShapeElevationGallery() {
  return (
    <GallerySection id="shape" title="Shape & elevation" note="--md-sys-shape-corner-<size>, --md-sys-elevation-level0..5">
      <div className="gallery-tiles">
        {SHAPES.map((s) => (
          <div key={s} className="gallery-tile" style={{ borderRadius: `var(--md-sys-shape-corner-${s})` }}>
            <code>{s}</code>
          </div>
        ))}
      </div>
      <div className="gallery-tiles">
        {[0, 1, 2, 3, 4, 5].map((l) => (
          <div key={l} className="gallery-tile gallery-tile--raised" style={{ boxShadow: `var(--md-sys-elevation-level${l})` }}>
            <code>level{l}</code>
          </div>
        ))}
      </div>
    </GallerySection>
  );
}
