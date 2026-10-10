import { useId } from 'react';
import { Card } from '../m3/Card';
import { Icon } from '../m3/Icon';
import type { IconName } from '../m3/icons';
import './ChartCard.css';

interface Props {
  title: string;
  icon: IconName;
  subtitle?: string;
  children: React.ReactNode;
}

/** Outlined card with a title-medium heading that names the chart region. */
export function ChartCard({ title, icon, subtitle, children }: Props) {
  const id = useId();
  return (
    <Card as="section" variant="outlined" className="admin-chart-card" aria-labelledby={id}>
      <div className="admin-chart-card__head">
        <Icon name={icon} size={20} className="admin-chart-card__icon" />
        <div>
          <h2 id={id} className="admin-chart-card__title">{title}</h2>
          {subtitle && <p className="admin-chart-card__subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

/**
 * One column on compact/medium; on expanded (>= 840px) `start` and `end` become two independent
 * columns, so cards of different heights stack without leaving holes.
 */
export function ChartGrid({ start, end }: { start: React.ReactNode; end: React.ReactNode }) {
  return (
    <div className="admin-chart-grid">
      <div className="admin-chart-grid__col">{start}</div>
      <div className="admin-chart-grid__col">{end}</div>
    </div>
  );
}
