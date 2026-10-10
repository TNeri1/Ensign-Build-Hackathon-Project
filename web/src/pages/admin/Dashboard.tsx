import { useGet } from '../../api/useApi';
import { BarChart, type BarTone } from '../../components/BarChart';
import { ChartCard, ChartGrid } from '../../components/admin/ChartCard';
import { KpiGrid, KpiTile } from '../../components/admin/KpiTile';
import { Alert } from '../../components/m3/Alert';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { LinkButton } from '../../components/m3/LinkButton';
import { PageHeader } from '../../components/m3/PageHeader';
import { stateLabel } from '../../components/m3/StatusChip';
import type { IconName } from '../../components/m3/icons';

interface Analytics {
  totalItems: number;
  byState: { state: string; count: number }[];
  byBin: { bin: string; label: string; count: number }[];
  claims: { submitted: number; approved: number; denied: number; released: number };
  returnRate: number;
  medianHoursToReturn: number | null;
  topLocations: { area: string; count: number }[];
}

const fmtHours = (h: number | null) => (h === null ? '—' : h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} days`);

/** Bar color + icon per item state, matching the StatusChip tones. */
const STATE_STYLE: Record<string, { tone: BarTone; icon: IconName }> = {
  found: { tone: 'secondary', icon: 'travel_explore' },
  stored: { tone: 'primary', icon: 'warehouse' },
  claim_pending: { tone: 'warning', icon: 'hourglass_empty' },
  verified: { tone: 'success', icon: 'verified' },
  released: { tone: 'neutral', icon: 'task_alt' },
  disposed: { tone: 'error', icon: 'delete' },
};

export function Dashboard() {
  const { data, error } = useGet<Analytics>('/admin/analytics');
  const header = (
    <PageHeader
      title="Dashboard"
      subtitle="Inventory, returns and claims for your venue."
      actions={<LinkButton to="/admin/retention" variant="tonal" icon="delete_sweep">Retention</LinkButton>}
    />
  );
  if (error) return <div className="app-page app-page--wide">{header}<Alert kind="error" title="Could not load analytics">{error}</Alert></div>;
  if (!data) return <div className="app-page app-page--wide">{header}<LinearProgress label="Loading analytics" /></div>;
  return (
    <div className="app-page app-page--wide">
      {header}
      <div className="md-stack md-stack--lg">
        <KpiGrid label="Key figures">
          <KpiTile icon="inventory_2" tone="primary" value={data.totalItems} label="items logged" />
          <KpiTile icon="task_alt" tone="success" value={`${Math.round(data.returnRate * 100)}%`} label="returned to owners" />
          <KpiTile icon="schedule" tone="tertiary" value={fmtHours(data.medianHoursToReturn)} label="median time to return" />
          <KpiTile icon="verified" tone="secondary" value={`${data.claims.approved}/${data.claims.submitted}`} label="claims approved" />
        </KpiGrid>
        <ChartGrid
          start={
            <>
              <ChartCard title="Inventory by state" icon="bar_chart">
                <BarChart
                  label="Inventory by state"
                  data={data.byState.map((s) => ({ label: stateLabel(s.state), value: s.count, ...STATE_STYLE[s.state] }))}
                />
              </ChartCard>
              <ChartCard title="Items in each bin" icon="warehouse">
                <BarChart label="Items in each bin" data={data.byBin.map((b) => ({ label: `${b.bin} · ${b.label}`, value: b.count }))} />
              </ChartCard>
            </>
          }
          end={
            <ChartCard title="Where items are found" icon="location_on">
              <BarChart label="Where items are found" data={data.topLocations.map((l) => ({ label: l.area, value: l.count }))} />
            </ChartCard>
          }
        />
      </div>
    </div>
  );
}
