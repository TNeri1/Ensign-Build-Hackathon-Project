import { useState } from 'react';
import { parsePickupCode } from '@vlf/shared';
import { api } from '../../api/client';
import { QrScanner } from '../../components/QrScanner';

interface Lookup { claimantEmail: string; item: { id: string; category: string; color: string; foundArea: string } }

export function Pickup() {
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [code, setCode] = useState('');
  const [manual, setManual] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [scanning, setScanning] = useState(true);

  async function find(raw: string) {
    setErr(''); setMsg('');
    try {
      const c = parsePickupCode(raw);
      setLookup(await api.post<Lookup>('/pickup/lookup', { code: c }));
      setCode(c); setScanning(false);
    } catch (e) { setErr((e as Error).message); }
  }

  async function release() {
    try {
      await api.post('/pickup/release', { code, idChecked: true });
      setMsg('Item released. Custody log updated.'); setLookup(null); setIdChecked(false); setScanning(true);
    } catch (e) { setErr((e as Error).message); }
  }

  return (
    <div className="stack">
      <h1>Pickup</h1>
      {msg && <p className="ok">{msg}</p>}
      {err && <p className="error">{err}</p>}
      {!lookup && scanning && <QrScanner onScan={find} />}
      {!lookup && (
        <div className="card stack">
          <label className="field"><span>Manual entry (if the camera is unavailable)</span>
            <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Paste pickup code" />
          </label>
          <button onClick={() => find(manual)} disabled={manual.length < 10}>Look up</button>
        </div>
      )}
      {lookup && (
        <div className="card stack">
          <h2>{lookup.item.category} · {lookup.item.color}</h2>
          <p>Release to <strong>{lookup.claimantEmail}</strong></p>
          <label><input type="checkbox" checked={idChecked} onChange={(e) => setIdChecked(e.target.checked)} style={{ width: 'auto' }} /> I checked the claimant&apos;s photo ID</label>
          <button className="primary big" disabled={!idChecked} onClick={release}>Release item</button>
        </div>
      )}
    </div>
  );
}
