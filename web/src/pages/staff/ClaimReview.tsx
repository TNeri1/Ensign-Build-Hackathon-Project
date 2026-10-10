import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';

interface Review {
  claim: { id: string; status: string; claimantEmail: string; decisionReason: string | null };
  item: { id: string; category: string; color: string; foundArea: string; state: string; hasPhoto: boolean; sensitive: boolean };
  comparisons: { field: string; question: string; expected: string; given: string; autoMatch: boolean }[];
}

export function ClaimReview() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data, error } = useGet<Review>(`/claims/${id}`);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');

  async function decide(decision: 'approve' | 'deny') {
    try { await api.post(`/claims/${id}/decision`, { decision, reason }); nav('/staff/claims'); } catch (e) { setErr((e as Error).message); }
  }

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading…</p>;
  const pending = data.claim.status === 'submitted';

  return (
    <div className="stack">
      <h1>Review claim</h1>
      <p>{data.claim.claimantEmail} claims <Link to={`/staff/items/${data.item.id}`}>{data.item.category} · {data.item.color}</Link> (found near {data.item.foundArea})</p>
      <table className="compare">
        <thead><tr><th>Question</th><th>Claimant said</th><th>On record (private)</th><th></th></tr></thead>
        <tbody>
          {data.comparisons.map((c) => (
            <tr key={c.field}>
              <td>{c.question}</td><td>{c.given}</td><td>{c.expected}</td>
              <td className={c.autoMatch ? 'ok' : 'error'}>{c.autoMatch ? '✓ match' : '✗ differs'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pending ? (
        <div className="card stack">
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required to deny)" />
          {err && <p className="error">{err}</p>}
          <div className="row">
            <button className="primary" onClick={() => decide('approve')}>Approve</button>
            <button onClick={() => decide('deny')}>Deny</button>
          </div>
        </div>
      ) : <p>Status: <strong>{data.claim.status}</strong> {data.claim.decisionReason}</p>}
    </div>
  );
}
