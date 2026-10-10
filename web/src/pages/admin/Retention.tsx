import { useState } from 'react';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';

interface Flagged { id: string; categoryLabel: string; color: string; foundArea: string; foundAt: string; sensitive: number; daysOverdue: number }

export function Retention() {
  const { data, reload } = useGet<Flagged[]>('/retention/flagged');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  async function run() {
    const r = await api.post<{ flagged: number }>('/retention/run');
    setMsg(`${r.flagged} newly flagged.`); reload();
  }
  async function dispose() {
    if (!window.confirm(`Dispose ${sel.size} item(s)? This is logged and cannot be undone.`)) return;
    try {
      const r = await api.post<{ disposed: number }>('/retention/dispose', { itemIds: [...sel] });
      setMsg(`${r.disposed} disposed.`); setSel(new Set()); reload();
    } catch (e) { setMsg((e as Error).message); }
  }

  return (
    <div className="stack">
      <h1>Retention</h1>
      <div className="row"><button onClick={run}>Run retention check</button><button className="primary" disabled={!sel.size} onClick={dispose}>Dispose selected ({sel.size})</button></div>
      {msg && <p className="ok">{msg}</p>}
      {data?.length === 0 && <p className="muted">Nothing is past its retention period.</p>}
      <ul className="list">
        {data?.map((i) => (
          <li key={i.id}>
            <label><input type="checkbox" style={{ width: 'auto' }} checked={sel.has(i.id)} onChange={() => toggle(i.id)} />{' '}
              <strong>{i.categoryLabel}</strong> · {i.color} · {i.foundArea} — {i.daysOverdue} days overdue {i.sensitive ? '🔒' : ''}</label>
          </li>
        ))}
      </ul>
    </div>
  );
}
