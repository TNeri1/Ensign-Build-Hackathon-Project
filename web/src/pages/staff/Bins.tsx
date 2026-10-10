import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import type { Bin } from '../../api/types';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { EmptyState } from '../../components/m3/EmptyState';
import { Icon } from '../../components/m3/Icon';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { LinkButton } from '../../components/m3/LinkButton';
import { PageHeader } from '../../components/m3/PageHeader';
import { useSnackbar } from '../../components/m3/Snackbar';
import { TextField } from '../../components/m3/TextField';
import './Bins.css';

function BinCard({ bin }: { bin: Bin }) {
  return (
    <li>
      <Card variant="outlined" as="article" className="staff-bin">
        <div className="staff-bin__head">
          <span className="staff-bin__avatar" aria-hidden="true"><Icon name="warehouse" size={24} /></span>
          <div className="staff-bin__text">
            <h2 className="staff-bin__code">{bin.code}</h2>
            <p className="staff-bin__label">{bin.label}</p>
          </div>
        </div>
        <div className="staff-bin__foot">
          <span className="staff-bin__count">
            <Icon name="inventory_2" size={18} />
            {bin.item_count} {bin.item_count === 1 ? 'item' : 'items'}
          </span>
          <LinkButton to={`/staff/bins/${bin.code}/label`} variant="text" icon="qr_code_2">QR label</LinkButton>
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
    <div className="app-page app-page--wide">
      <PageHeader title="Storage bins" subtitle="Where stored items live. Print a QR label for each bin so staff can scan items in and out." />
      <div className="staff-bins">
        <section aria-label="Bins" className="staff-bins__list">
          {loadError && <Alert kind="error" title="Could not load bins">{loadError}</Alert>}
          {!data && !loadError && <LinearProgress label="Loading bins" />}
          {data?.length === 0 && <EmptyState icon="warehouse" title="No bins yet" body="Add your first storage bin with the form." />}
          {!!data?.length && (
            <ul role="list" className="staff-bins__grid">
              {data.map((b) => <BinCard key={b.id} bin={b} />)}
            </ul>
          )}
        </section>
        <Card variant="filled" as="section" className="staff-bins__form" aria-labelledby="add-bin-title">
          <form onSubmit={add} className="md-stack">
            <div className="md-stack md-stack--xs">
              <h2 id="add-bin-title" className="md-typescale-title-large">Add bin</h2>
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
