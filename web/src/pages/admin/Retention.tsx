import { useState } from 'react';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import { FlaggedItemRow, type FlaggedItem } from '../../components/admin/FlaggedItemRow';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { Checkbox } from '../../components/m3/Checkbox';
import { Dialog } from '../../components/m3/Dialog';
import { EmptyState } from '../../components/m3/EmptyState';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { PageHeader } from '../../components/m3/PageHeader';
import { useSnackbar } from '../../components/m3/Snackbar';
import './Retention.css';

export function Retention() {
  const { data, error, reload } = useGet<FlaggedItem[]>('/retention/flagged');
  const snackbar = useSnackbar();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = !!data?.length && data.every((i) => sel.has(i.id));
  const toggleAll = () => setSel(allSelected ? new Set() : new Set(data?.map((i) => i.id)));

  async function run() {
    setBusy(true);
    try {
      const r = await api.post<{ flagged: number }>('/retention/run');
      snackbar.show(`${r.flagged} newly flagged.`); reload();
    } catch (e) { snackbar.show((e as Error).message, { kind: 'error' }); }
    finally { setBusy(false); }
  }
  async function dispose() {
    setConfirming(false);
    setBusy(true);
    try {
      const r = await api.post<{ disposed: number }>('/retention/dispose', { itemIds: [...sel] });
      snackbar.show(`${r.disposed} disposed.`); setSel(new Set()); reload();
    } catch (e) { snackbar.show((e as Error).message, { kind: 'error' }); }
    finally { setBusy(false); }
  }

  const n = sel.size;
  return (
    <div className="app-page app-page--wide">
      <PageHeader
        title="Retention"
        subtitle="Items kept past their category's retention period are flagged here. The check runs every hour; run it now to refresh. Disposal is logged in each item's chain of custody."
        actions={
          <>
            <Button variant="tonal" icon="refresh" onClick={run} disabled={busy}>Run retention check</Button>
            <Button variant="filled" icon="delete_sweep" className="admin-retention__dispose" disabled={!n || busy} onClick={() => setConfirming(true)}>
              Dispose selected
            </Button>
          </>
        }
      />
      <div className="md-stack md-stack--lg">
        {busy && <LinearProgress label="Working" />}
        {error && <Alert kind="error" title="Could not load flagged items">{error}</Alert>}
        {!data && !error && <LinearProgress label="Loading flagged items" />}
        {data?.length === 0 && (
          <EmptyState icon="task_alt" title="Nothing overdue" body="Nothing is past its retention period." />
        )}
        {!!data?.length && (
          <Card variant="outlined" className="md-card--flush admin-retention__card">
            <div className="admin-retention__toolbar">
              <Checkbox checked={allSelected} onChange={toggleAll} label="Select all" />
              <span className="admin-retention__count" aria-live="polite">
                {n ? `${n} of ${data.length} selected` : `${data.length} flagged`}
              </span>
            </div>
            <ul className="admin-retention__list" role="list" aria-label="Items past retention">
              {data.map((i) => (
                <FlaggedItemRow key={i.id} item={i} selected={sel.has(i.id)} onToggle={() => toggle(i.id)} />
              ))}
            </ul>
          </Card>
        )}
      </div>
      <Dialog
        open={confirming}
        destructive
        icon="delete_sweep"
        title={`Dispose ${n} item(s)?`}
        confirmLabel="Dispose"
        onConfirm={dispose}
        onClose={() => setConfirming(false)}
      >
        This is logged in each item&apos;s chain of custody and cannot be undone.
      </Dialog>
    </div>
  );
}
