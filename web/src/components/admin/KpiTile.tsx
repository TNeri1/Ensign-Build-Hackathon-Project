import { Card } from '../m3/Card';
import { Icon } from '../m3/Icon';
import type { IconName } from '../m3/icons';
import './KpiTile.css';

export type KpiTone = 'primary' | 'secondary' | 'tertiary' | 'success';

interface Props {
  icon: IconName;
  value: React.ReactNode;
  label: string;
  tone?: KpiTone;
}

/** Dashboard KPI: icon in a tonal circle, big value, body-medium label. */
export function KpiTile({ icon, value, label, tone = 'primary' }: Props) {
  return (
    <Card variant="filled" className={`admin-kpi admin-kpi--${tone}`}>
      <span className="admin-kpi__icon" aria-hidden="true">
        <Icon name={icon} size={24} />
      </span>
      <span className="admin-kpi__value">{value}</span>
      <span className="admin-kpi__label">{label}</span>
    </Card>
  );
}

/** Responsive KPI row: 2 columns on compact/medium, 4 on expanded. */
export function KpiGrid({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <section className="admin-kpi-grid" aria-label={label}>
      {children}
    </section>
  );
}
