import { Icon } from './m3/Icon';
import type { IconName } from './m3/icons';
import './BarChart.css';

/** Fill role for one bar. Defaults to primary; state charts can follow the StatusChip tones. */
export type BarTone = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'success' | 'error' | 'neutral';

export interface BarDatum {
  label: string;
  value: number;
  tone?: BarTone;
  icon?: IconName;
}

interface Props {
  data: BarDatum[];
  unit?: string;
  /** Accessible name for the whole chart (usually the card heading). */
  label?: string;
  /** Shown instead of the bars when there is no data. */
  emptyText?: string;
}

/**
 * Material 3 horizontal bar chart in plain CSS: label (body-medium) and value (label-large) above
 * a full-width tonal track with a rounded bar. Each bar is a list item with an aria-label carrying
 * its value, so screen readers get the numbers without the geometry.
 */
export function BarChart({ data, unit = '', label, emptyText = 'No data yet.' }: Props) {
  if (data.length === 0) return <p className="data-bars__empty">{emptyText}</p>;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="data-bars" role="list" aria-label={label}>
      {data.map((d) => {
        const text = `${d.value}${unit}`;
        return (
          <li
            key={d.label}
            className={`data-bars__row data-bars__row--${d.tone ?? 'primary'}`}
            aria-label={`${d.label}: ${text}`}
            title={`${d.label}: ${text}`}
          >
            <span className="data-bars__label" aria-hidden="true">
              {d.icon && <Icon name={d.icon} size={18} className="data-bars__icon" />}
              <span className="data-bars__label-text">{d.label}</span>
            </span>
            <span className="data-bars__value" aria-hidden="true">{text}</span>
            <span className="data-bars__track" aria-hidden="true">
              {d.value > 0 && <span className="data-bars__fill" style={{ width: `${(d.value / max) * 100}%` }} />}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
