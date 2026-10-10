import { Link } from 'react-router-dom';
import { useGet } from '../../api/useApi';

interface Row { id: string; status: string; claimantEmail: string; submittedAt: string; category: string; color: string }

export function Claims() {
  const { data } = useGet<Row[]>('/claims?status=submitted');
  return (
    <div className="stack">
      <h1>Claims to review</h1>
      {data?.length === 0 && <p className="muted">No claims waiting.</p>}
      <ul className="list">
        {data?.map((c) => (
          <li key={c.id}><Link to={`/staff/claims/${c.id}`}>{c.category} · {c.color} — {c.claimantEmail} <span className="muted">{new Date(c.submittedAt).toLocaleString()}</span></Link></li>
        ))}
      </ul>
    </div>
  );
}
