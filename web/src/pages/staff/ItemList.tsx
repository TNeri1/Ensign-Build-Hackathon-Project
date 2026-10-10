import { Link } from 'react-router-dom';
import { useGet } from '../../api/useApi';
import type { ItemListRow } from '../../api/types';

export function ItemList() {
  const { data, error, loading } = useGet<ItemListRow[]>('/items');
  return (
    <div className="stack">
      <div className="row">
        <h1>Inventory</h1>
        <Link className="primary btn" to="/staff/intake">+ Log item</Link>
      </div>
      <p><Link to="/staff/bins">Manage bins &amp; labels</Link></p>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {data?.map((i) => (
          <li key={i.id}>
            <Link to={`/staff/items/${i.id}`}>
              <strong>{i.category}</strong> · {i.color} · {i.foundArea}
              <span className={`badge ${i.state}`}>{i.state.replace('_', ' ')}</span>
              {i.binCode && <span className="muted"> · bin {i.binCode}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
