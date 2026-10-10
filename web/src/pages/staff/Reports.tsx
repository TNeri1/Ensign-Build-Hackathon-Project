import { useGet } from '../../api/useApi';
import { Alert } from '../../components/m3/Alert';
import { EmptyState } from '../../components/m3/EmptyState';
import { HeroHeader } from '../../components/m3/HeroHeader';
import { Icon } from '../../components/m3/Icon';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { List, ListItem } from '../../components/m3/ListItem';
import { CategoryAvatar, categoryColorLine } from '../../components/claims/CategoryAvatar';
import { formatDateTime } from '../../lib/format';
import './Reports.css';

interface Report {
  id: string; category: string; color: string; area: string; window_start: string; window_end: string;
  description: string; contact_email: string; created_at: string;
}

/** Lost reports filed by the public. Staff-only because they include contact emails. */
export function Reports() {
  const { data, error, loading } = useGet<Report[]>('/reports');
  const count = data?.length ?? 0;
  return (
    <div className="app-page staff-page md-stack">
      <HeroHeader
        title="Lost reports"
        icon="campaign"
        shape="flower"
        subtitle={count > 0 ? `${count} filed by visitors` : 'Filed by visitors from the public site'}
      />
      {loading && !data && <LinearProgress label="Loading reports" />}
      {error && <Alert kind="error">{error}</Alert>}
      {data && count === 0 && (
        <EmptyState icon="campaign" title="No reports yet" body="When a visitor reports a lost item it shows up here and is matched against found items." />
      )}
      {count > 0 && (
        <List className="staff-seglist reports-list">
          {data!.map((r) => (
            <ListItem
              key={r.id}
              leading={<CategoryAvatar category={r.category} color={r.color} />}
              headline={`${categoryColorLine(r.category, r.color)} · ${r.area}`}
              supporting={
                <>
                  <span className="reports-list__meta">
                    <span className="reports-list__when"><Icon name="schedule" size={16} />{formatDateTime(r.window_start)} – {formatDateTime(r.window_end)}</span>
                    <span className="reports-list__email"><Icon name="mail" size={16} />{r.contact_email}</span>
                  </span>
                  {r.description && <span className="reports-list__desc">{r.description}</span>}
                </>
              }
            />
          ))}
        </List>
      )}
    </div>
  );
}
