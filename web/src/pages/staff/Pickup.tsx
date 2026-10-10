import { useState, type FormEvent } from 'react';
import { parsePickupCode } from '@vlf/shared';
import { api } from '../../api/client';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { Checkbox } from '../../components/m3/Checkbox';
import { ShapeIcon } from '../../components/m3/ExpressiveShape';
import { HeroHeader } from '../../components/m3/HeroHeader';
import { Icon } from '../../components/m3/Icon';
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
    <div className="app-page app-page--wide staff-page staff-hero-tight pickup md-stack">
      <HeroHeader title="Pickup" icon="qr_code_scanner" shape="sunny" subtitle="Scan the claimant's pickup QR code, check their photo ID, then release the item." />
      {msg && (
        <section className="pickup__done md-rise" role="status">
          <span className="pickup__confetti pickup__confetti--a" aria-hidden="true"><ShapeIcon shape="flower" tone="tertiary" size={40} /></span>
          <span className="pickup__confetti pickup__confetti--b" aria-hidden="true"><ShapeIcon shape="clover" tone="primary" size={28} /></span>
          <span className="pickup__confetti pickup__confetti--c" aria-hidden="true"><ShapeIcon shape="cookie" tone="warning" size={20} /></span>
          <ShapeIcon shape="sunny" tone="success" icon="task_alt" size={96} spin className="pickup__done-shape" />
          <div className="pickup__done-text">
            <h2 className="pickup__done-title">Item released</h2>
            <p className="pickup__done-body">{msg}</p>
          </div>
        </section>
      )}
      {err && <Alert kind="error">{err}</Alert>}
      {!lookup && (
        <div className="pickup__grid">
          {scanning && (
            <Card variant="filled" className="staff-card pickup__card" as="section">
              <div className="md-stack">
                <h2 className="claims-card-title"><ShapeIcon shape="sunny" tone="primary" icon="qr_code_scanner" size={40} />Scan pickup code</h2>
                <QrScanner onScan={find} />
              </div>
            </Card>
          )}
          <Card variant="filled" className="staff-card pickup__card" as="section">
            <form className="md-stack" onSubmit={submitManual}>
              <h2 className="claims-card-title"><ShapeIcon shape="clover" tone="tertiary" icon="edit" size={40} />Manual entry</h2>
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
        <Card variant="filled" className="staff-card pickup__result md-rise" as="section">
          <div className="md-stack md-stack--lg">
            <div className="pickup__item">
              <CategoryAvatar category={lookup.item.category} color={lookup.item.color} size="xlarge" />
              <div className="claims-field">
                <span className="pickup__ready"><Icon name="verified" size={16} />Ready for pickup</span>
                <h2 className="pickup__title">{lookup.item.title}</h2>
                <span className="pickup__meta">{categoryColorLine(lookup.item.category, lookup.item.color)}</span>
                <span className="pickup__meta"><Icon name="location_on" size={16} />Found near {lookup.item.foundArea}</span>
              </div>
            </div>
            <div className="pickup__claimant">
              <ShapeIcon shape="circle" tone="secondary" icon="person" size={40} />
              <div className="claims-field">
                <span className="claims-field__label">Release to</span>
                <strong className="claims-field__value">{lookup.claimantEmail}</strong>
              </div>
            </div>
            <div className={`pickup__check${idChecked ? ' pickup__check--done' : ''}`}>
              <Checkbox checked={idChecked} onChange={setIdChecked} label="I checked the claimant's photo ID" />
            </div>
            <Button variant="filled" size="large" full icon="task_alt" disabled={!idChecked} onClick={release} className="pickup__release">Release item</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
