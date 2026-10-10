import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { ShapeIcon } from '../../components/m3/ExpressiveShape';
import { Icon } from '../../components/m3/Icon';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { PageHeader } from '../../components/m3/PageHeader';
import { StatusChip } from '../../components/m3/StatusChip';
import { TextField } from '../../components/m3/TextField';
import { AnswerComparison, type Comparison } from '../../components/claims/AnswerComparison';
import { CategoryAvatar, categoryColorLine } from '../../components/claims/CategoryAvatar';
import './ClaimReview.css';

interface Review {
  claim: { id: string; status: string; claimantEmail: string; decisionReason: string | null };
  item: { id: string; title: string; category: string; color: string; foundArea: string; state: string; hasPhoto: boolean; sensitive: boolean };
  comparisons: Comparison[];
}

export function ClaimReview() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data, error } = useGet<Review>(`/claims/${id}`);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState<'approve' | 'deny' | null>(null);

  async function decide(decision: 'approve' | 'deny') {
    setBusy(true); setTried(decision);
    try { await api.post(`/claims/${id}/decision`, { decision, reason }); nav('/staff/claims'); } catch (e) { setErr((e as Error).message); setBusy(false); }
  }

  const header = <PageHeader title="Review claim" back="/staff/claims" subtitle={data && <StatusChip state={data.claim.status} />} />;
  if (error) return <div className="app-page app-page--wide md-stack">{header}<Alert kind="error">{error}</Alert></div>;
  if (!data) return <div className="app-page app-page--wide md-stack">{header}<LinearProgress label="Loading claim" /></div>;
  const pending = data.claim.status === 'submitted';
  const { claim, item } = data;

  return (
    <div className="app-page app-page--wide claim-review md-stack">
      {header}
      <Card variant="filled" className="staff-card claim-review__summary">
        <div className="claim-review__party">
          <ShapeIcon shape="circle" tone="secondary" icon="person" size={48} />
          <div className="claims-field">
            <span className="claims-field__label">Claimant</span>
            <span className="claims-field__value claim-review__email">{claim.claimantEmail}</span>
          </div>
        </div>
        <div className="claim-review__party">
          <CategoryAvatar category={item.category} color={item.color} size="large" />
          <div className="claims-field claim-review__item">
            <span className="claims-field__label">Claims item</span>
            <Link to={`/staff/items/${item.id}`} className="claims-field__value claim-review__item-link">{item.title}</Link>
            <span className="claim-review__where">{categoryColorLine(item.category, item.color)}</span>
            <span className="claim-review__where"><Icon name="location_on" size={16} />Found near {item.foundArea}</span>
            <span className="claim-review__state"><StatusChip state={item.state} /></span>
          </div>
        </div>
      </Card>

      <Card variant="filled" className="staff-card claim-review__compare" as="section">
        <div className="md-stack">
          <h2 className="claims-card-title"><ShapeIcon shape="clover" tone="tertiary" icon="assignment" size={40} />Verification answers</h2>
          <AnswerComparison rows={data.comparisons} />
        </div>
      </Card>

      {pending ? (
        <Card variant="filled" className="staff-card claim-review__decision" as="section">
          <div className="md-stack">
            <h2 className="claims-card-title"><ShapeIcon shape="flower" tone="primary" icon="verified" size={40} />Decision</h2>
            <TextField
              label="Reason (required to deny)"
              value={reason}
              onChange={setReason}
              multiline
              rows={2}
              supportingText="Sent to the claimant with the decision."
              error={err && tried === 'deny' && !reason.trim() ? 'Enter a reason to deny this claim.' : undefined}
            />
            {err && <Alert kind="error">{err}</Alert>}
            <div className="claim-review__actions">
              <Button variant="outlined" size="large" icon="close" className="claim-review__deny" disabled={busy} onClick={() => decide('deny')}>Deny</Button>
              <Button variant="filled" size="large" icon="check" disabled={busy} onClick={() => decide('approve')}>Approve</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Alert kind={claim.status === 'denied' ? 'warning' : 'success'} title={`Claim ${claim.status}`}>
          {claim.decisionReason || 'No reason recorded.'}
        </Alert>
      )}
    </div>
  );
}
