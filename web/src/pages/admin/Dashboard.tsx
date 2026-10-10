import { Link } from 'react-router-dom';
import { useGet } from '../../api/useApi';
import { BarChart } from '../../components/BarChart';

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

export function Dashboard() {
  const { data, error } = useGet<Analytics>('/admin/analytics');
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading…</p>;
  return (
    <div className="stack">
      <div className="row"><h1>Dashboard</h1><Link to="/admin/retention">Retention</Link></div>
      <div className="tiles">
        <div className="tile"><b>{data.totalItems}</b><span>items logged</span></div>
        <div className="tile"><b>{Math.round(data.returnRate * 100)}%</b><span>returned to owners</span></div>
        <div className="tile"><b>{fmtHours(data.medianHoursToReturn)}</b><span>median time to return</span></div>
        <div className="tile"><b>{data.claims.approved}/{data.claims.submitted}</b><span>claims approved</span></div>
      </div>
      <h2>Inventory by state</h2>
      <BarChart data={data.byState.map((s) => ({ label: s.state.replace('_', ' '), value: s.count }))} />
      <h2>Items in each bin</h2>
      <BarChart data={data.byBin.map((b) => ({ label: `${b.bin} · ${b.label}`, value: b.count }))} />
      <h2>Where items are found</h2>
      <BarChart data={data.topLocations.map((l) => ({ label: l.area, value: l.count }))} />
    </div>
  );
}
