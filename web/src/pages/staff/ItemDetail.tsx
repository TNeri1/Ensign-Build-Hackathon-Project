import { useParams } from 'react-router-dom';
import { useGet } from '../../api/useApi';
import { ItemPhoto } from '../../components/ItemPhoto';

interface Detail {
  id: string; category: string; color: string; state: string; found_area: string; found_at: string;
  sensitive: number; photo_path: string | null;
  attributes: { key: string; value: string; is_public: number }[];
  custody: { id: number; at: string; actor_label: string; from_state: string | null; to_state: string; note: string }[];
}

export function ItemDetail() {
  const { id } = useParams();
  const { data, error } = useGet<Detail>(`/items/${id}`);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading…</p>;
  return (
    <div className="stack">
      <h1>{data.category} · {data.color}</h1>
      <span className={`badge ${data.state}`}>{data.state.replace('_', ' ')}</span>
      {data.photo_path && <ItemPhoto itemId={data.id} sensitive={!!data.sensitive} />}
      <p>Found at {data.found_area}, {new Date(data.found_at).toLocaleString()}</p>
      <h2>Details</h2>
      <ul className="list">
        {data.attributes.map((a) => <li key={a.key}><strong>{a.key}</strong>: {a.value} <em className="muted">{a.is_public ? 'public' : 'private'}</em></li>)}
      </ul>
      <h2>Chain of custody</h2>
      <ol className="list">
        {data.custody.map((e) => (
          <li key={e.id}>{new Date(e.at).toLocaleString()} — {e.from_state ?? 'new'} → <strong>{e.to_state}</strong> by {e.actor_label}{e.note && ` (${e.note})`}</li>
        ))}
      </ol>
    </div>
  );
}
