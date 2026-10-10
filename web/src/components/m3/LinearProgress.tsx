import './LinearProgress.css';

export interface LinearProgressProps {
  /** 0..1. Omit for an indeterminate indicator. */
  value?: number;
  /** Accessible name (aria-label). */
  label?: string;
}

/** One sine wave per 24 units across 480: the SVG is twice the track width and slides by half. */
const WAVE = (() => {
  let d = 'M0,6';
  for (let x = 0; x < 480; x += 24) d += ` q6,-5 12,0 t12,0`;
  return d;
})();

/** Material 3 linear progress indicator. Determinate: thick rounded bar. Indeterminate: M3 Expressive wavy. */
export function LinearProgress({ value, label }: LinearProgressProps) {
  const determinate = typeof value === 'number' && Number.isFinite(value);
  const pct = determinate ? Math.min(1, Math.max(0, value)) : 0;
  return (
    <div
      className={`md-linear-progress${determinate ? '' : ' md-linear-progress--indeterminate'}`}
      role="progressbar"
      aria-label={label ?? 'Loading'}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      aria-valuenow={determinate ? Math.round(pct * 100) : undefined}
    >
      {determinate ? (
        <span className="md-linear-progress__bar" style={{ transform: `scaleX(${pct})` }} />
      ) : (
        // M3 Expressive wavy indicator: a sine wave sliding along the track (static wave with reduced motion).
        <svg className="md-linear-progress__wave" viewBox="0 0 480 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d={WAVE} />
        </svg>
      )}
    </div>
  );
}
