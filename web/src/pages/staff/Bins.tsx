import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import type { Bin } from '../../api/types';

export function Bins() {
  const { data, reload } = useGet<Bin[]>('/bins');
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  async function add(e: FormEvent) {
    e.preventDefault();
    try { await api.post('/bins', { code, label }); setCode(''); setLabel(''); setError(''); reload(); } catch (err) { setError((err as Error).message); }
  }

  return (
    <div className="stack">
      <h1>Storage bins</h1>
      <ul className="list">
        {data?.map((b) => (
          <li key={b.id} className="row">
            <span><strong>{b.code}</strong> {b.label} <span className="muted">({b.item_count} items)</span></span>
            <Link to={`/staff/bins/${b.code}/label`}>QR label</Link>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="card stack">
        <h2>Add bin</h2>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (e.g. A3)" required />
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. Front desk shelf)" required />
        {error && <p className="error">{error}</p>}
        <button className="primary">Add</button>
      </form>
    </div>
  );
}
