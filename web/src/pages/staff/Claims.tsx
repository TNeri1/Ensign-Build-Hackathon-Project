import { useGet } from '../../api/useApi';
import { Alert } from '../../components/m3/Alert';
import { Card } from '../../components/m3/Card';
import { EmptyState } from '../../components/m3/EmptyState';
import { Icon } from '../../components/m3/Icon';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { List, ListItem } from '../../components/m3/ListItem';
import { PageHeader } from '../../components/m3/PageHeader';
import { StatusChip } from '../../components/m3/StatusChip';
import { CategoryAvatar, categoryColorLine } from '../../components/claims/CategoryAvatar';
import { relativeTime } from '../../lib/format';

interface Row { id: string; status: string; claimantEmail: string; submittedAt: string; title: string; category: string; color: string }

export function Claims() {
  const { data, error, loading } = useGet<Row[]>('/claims?status=submitted');
  const count = data?.length ?? 0;
  return (
    <div className="app-page md-stack">
      <PageHeader
        title="Claims to review"
        subtitle={data && count > 0 ? `${count} waiting for a decision` : 'Compare claimant answers with the private record'}
      />
      {loading && !data && <LinearProgress label="Loading claims" />}
      {error && <Alert kind="error">{error}</Alert>}
      {data && count === 0 && (
        <EmptyState icon="assignment_turned_in" title="No claims waiting" body="New claims appear here when a claimant answers the verification questions." />
      )}
      {count > 0 && (
        <Card variant="outlined" className="claims-list-card claims-rows">
          <List>
            {data!.map((c) => (
              <ListItem
                key={c.id}
                to={`/staff/claims/${c.id}`}
                leading={<CategoryAvatar category={c.category} color={c.color} />}
                headline={c.title}
                supporting={
                  <span className="claims-row__meta">
                    <span>{categoryColorLine(c.category, c.color)}</span>
                    <span className="claims-row__email">{c.claimantEmail}</span>
                    <span className="claims-row__time">{relativeTime(c.submittedAt)}</span>
                  </span>
                }
                trailing={<><StatusChip state={c.status} /><Icon name="chevron_right" /></>}
              />
            ))}
          </List>
        </Card>
      )}
    </div>
  );
}
