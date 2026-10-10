import { useGet } from '../../api/useApi';

interface Report {
  id: string; category: string; color: string; area: string; window_start: string; window_end: string;
  description: string; contact_email: string; created_at: string;
}

/** Lost reports filed by the public. Staff-only because they include contact emails. */
export function Reports() {
  const { data, error } = useGet<Report[]>('/reports');
  return (
    <div className="stack">
      <h1>Lost reports</h1>
      {error && <p className="error">{error}</p>}
      {data?.length === 0 && <p className="muted">No reports yet.</p>}
      <ul className="list">
        {data?.map((r) => (
          <li key={r.id}>
            <strong>{r.category}</strong> · {r.color} · {r.area}
            <div className="muted">
              {new Date(r.window_start).toLocaleString()} – {new Date(r.window_end).toLocaleString()} · {r.contact_email}
            </div>
            {r.description && <div>{r.description}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
