import { useState, type FormEvent } from 'react';
import { parsePickupCode } from '@vlf/shared';
import { api } from '../../api/client';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { Checkbox } from '../../components/m3/Checkbox';
import { Icon } from '../../components/m3/Icon';
import { PageHeader } from '../../components/m3/PageHeader';
import { TextField } from '../../components/m3/TextField';
import { QrScanner } from '../../components/QrScanner';
import { CategoryAvatar, categoryColorLine } from '../../components/claims/CategoryAvatar';
import './Pickup.css';

interface Lookup { claimantEmail: string; item: { id: string; title: string; category: string; color: string; foundArea: string } }

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
      setMsg('Custody log updated.'); setLookup(null); setIdChecked(false); setScanning(true);
    } catch (e) { setErr((e as Error).message); }
  }

  function submitManual(e: FormEvent) {
    e.preventDefault();
    if (manual.length >= 10) find(manual);
  }

  return (
    <div className="app-page app-page--wide pickup md-stack">
      <PageHeader title="Pickup" subtitle="Scan the claimant's pickup QR code, check their photo ID, then release the item." />
      {msg && <Alert kind="success" title="Item released">{msg}</Alert>}
      {err && <Alert kind="error">{err}</Alert>}
      {!lookup && (
        <div className="pickup__grid">
          {scanning && (
            <Card variant="outlined" className="pickup__card" as="section">
              <div className="md-stack">
                <h2 className="claims-card-title"><Icon name="qr_code_scanner" size={20} />Scan pickup code</h2>
                <QrScanner onScan={find} />
              </div>
            </Card>
          )}
          <Card variant="outlined" className="pickup__card" as="section">
            <form className="md-stack" onSubmit={submitManual}>
              <h2 className="claims-card-title"><Icon name="edit" size={20} />Manual entry</h2>
              <TextField
                label="Can't scan? Enter the code"
                value={manual}
                onChange={setManual}
                leadingIcon="qr_code"
                placeholder="vlf:pickup:…"
                autoComplete="off"
                supportingText="Accepts vlf:pickup:… or the bare token."
              />
              <div className="pickup__lookup">
                <Button type="submit" variant="filled" icon="search" disabled={manual.length < 10}>Look up</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {lookup && (
        <Card variant="elevated" className="pickup__result" as="section">
          <div className="md-stack md-stack--lg">
            <div className="pickup__item">
              <CategoryAvatar category={lookup.item.category} color={lookup.item.color} size="large" />
              <div className="claims-field">
                <span className="claims-field__label">Ready for pickup</span>
                <h2 className="pickup__title">{lookup.item.title}</h2>
                <span className="pickup__meta">{categoryColorLine(lookup.item.category, lookup.item.color)}</span>
                <span className="pickup__meta"><Icon name="location_on" size={16} />Found near {lookup.item.foundArea}</span>
              </div>
            </div>
            <div className="pickup__claimant">
              <Icon name="person" />
              <div className="claims-field">
                <span className="claims-field__label">Release to</span>
                <strong className="claims-field__value">{lookup.claimantEmail}</strong>
              </div>
            </div>
            <div className="pickup__check">
              <Checkbox checked={idChecked} onChange={setIdChecked} label="I checked the claimant's photo ID" />
            </div>
            <Button variant="filled" size="large" full icon="task_alt" disabled={!idChecked} onClick={release}>Release item</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
