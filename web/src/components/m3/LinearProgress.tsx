import './LinearProgress.css';

export interface LinearProgressProps {
  /** 0..1. Omit for an indeterminate indicator. */
  value?: number;
  /** Accessible name (aria-label). */
  label?: string;
}

/** Material 3 linear progress indicator (4px track, primary active indicator). */
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
        <>
          <span className="md-linear-progress__bar md-linear-progress__bar--primary" />
          <span className="md-linear-progress__bar md-linear-progress__bar--secondary" />
        </>
      )}
    </div>
  );
}
