import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import type { Bin } from '../../api/types';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { EmptyState } from '../../components/m3/EmptyState';
import { ShapeIcon, shapePath, type ShapeName } from '../../components/m3/ExpressiveShape';
import { HeroHeader } from '../../components/m3/HeroHeader';
import { Icon } from '../../components/m3/Icon';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { LinkButton } from '../../components/m3/LinkButton';
import { useSnackbar } from '../../components/m3/Snackbar';
import { TextField } from '../../components/m3/TextField';
import '../../components/claims/claims.css';
import './Bins.css';

const SHAPES: ShapeName[] = ['cookie', 'clover', 'sunny', 'flower', 'puffy', 'soft-square'];
const TONES = ['primary', 'tertiary', 'secondary'] as const;

/** A bin as an expressive card: its code set big inside a shape, the label, the item count and a label link. */
function BinCard({ bin, index }: { bin: Bin; index: number }) {
  return (
    <li>
      <Card variant="filled" as="article" className={`staff-bin staff-bin--${TONES[index % TONES.length]}`}>
        <div className="staff-bin__head">
          <span className="staff-bin__badge" aria-hidden="true">
            <svg viewBox="0 0 100 100" focusable="false"><path d={shapePath(SHAPES[index % SHAPES.length])} /></svg>
            <span className="staff-bin__badge-code">{bin.code}</span>
          </span>
          <div className="staff-bin__text">
            <h2 className="staff-bin__code"><span className="md-visually-hidden">Bin </span>{bin.code}</h2>
            <p className="staff-bin__label">{bin.label}</p>
          </div>
        </div>
        <div className="staff-bin__foot">
          <span className="staff-bin__count">
            <strong>{bin.item_count}</strong> {bin.item_count === 1 ? 'item' : 'items'}
          </span>
          <LinkButton to={`/staff/bins/${bin.code}/label`} variant="tonal" icon="qr_code_2">QR label</LinkButton>
        </div>
      </Card>
    </li>
  );
}

export function Bins() {
  const { data, error: loadError, reload } = useGet<Bin[]>('/bins');
  const snackbar = useSnackbar();
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  async function add(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/bins', { code, label });
      snackbar.show(`Bin ${code} added`);
      setCode(''); setLabel(''); setError(''); reload();
    } catch (err) { setError((err as Error).message); }
  }

  return (
    <div className="app-page app-page--wide staff-hero-tight">
      <HeroHeader title="Storage bins" icon="warehouse" shape="soft-square"
        subtitle="Where stored items live. Print a QR label for each bin so staff can scan items in and out." />
      <div className="staff-bins">
        <section aria-label="Bins" className="staff-bins__list">
          {loadError && <Alert kind="error" title="Could not load bins">{loadError}</Alert>}
          {!data && !loadError && <LinearProgress label="Loading bins" />}
          {data?.length === 0 && <EmptyState icon="warehouse" title="No bins yet" body="Add your first storage bin with the form." />}
          {!!data?.length && (
            <ul role="list" className="staff-bins__grid">
              {data.map((b, i) => <BinCard key={b.id} bin={b} index={i} />)}
            </ul>
          )}
        </section>
        <Card variant="filled" as="section" className="staff-card staff-bins__form" aria-labelledby="add-bin-title">
          <form onSubmit={add} className="md-stack">
            <div className="md-stack md-stack--xs">
              <h2 id="add-bin-title" className="claims-card-title"><ShapeIcon shape="sunny" tone="primary" icon="add" size={40} />Add bin</h2>
              <p className="md-typescale-body-medium md-on-surface-variant">Give it a short code and a label people will recognise.</p>
            </div>
            {error && <Alert kind="error">{error}</Alert>}
            <TextField label="Code" value={code} onChange={setCode} placeholder="e.g. A3" required autoComplete="off" />
            <TextField label="Label" value={label} onChange={setLabel} placeholder="e.g. Front desk shelf" required autoComplete="off" />
            <div className="md-row md-row--end">
              <Button type="submit" variant="filled" icon="add">Add bin</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
