import { useState } from 'react';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { Dialog } from '../../components/m3/Dialog';
import { EmptyState } from '../../components/m3/EmptyState';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { PageHeader } from '../../components/m3/PageHeader';
import { useSnackbar } from '../../components/m3/Snackbar';
import { StatusChip } from '../../components/m3/StatusChip';
import { TextField } from '../../components/m3/TextField';
import { GallerySection, Specimen } from './GallerySection';

const ITEM_STATES = ['found', 'stored', 'claim_pending', 'verified', 'released', 'disposed'];
const CLAIM_STATES = ['open', 'submitted', 'approved', 'denied'];

export function StatusGallery() {
  return (
    <GallerySection id="status" title="Status chips" note="StatusChip state=… ; stateLabel(state) gives the humanized text.">
      <Specimen label="item states">{ITEM_STATES.map((s) => <StatusChip key={s} state={s} />)}</Specimen>
      <Specimen label="claim statuses">{CLAIM_STATES.map((s) => <StatusChip key={s} state={s} />)}</Specimen>
      <Specimen label="unknown">
        <StatusChip state="something_else" />
      </Specimen>
    </GallerySection>
  );
}

export function AlertsGallery() {
  return (
    <GallerySection id="alerts" title="Alerts">
      <div className="md-stack md-stack--sm">
        <Alert kind="info" title="Heads up">Items are kept for 30 days before disposal.</Alert>
        <Alert kind="success">Claim approved. The owner has been emailed.</Alert>
        <Alert kind="warning" title="Pickup expires soon" action={<Button variant="text">Extend</Button>}>
          This item has been verified for 46 hours.
        </Alert>
        <Alert kind="error" title="Could not save">Network error. Check your connection and try again.</Alert>
      </div>
    </GallerySection>
  );
}

export function EmptyProgressGallery() {
  return (
    <GallerySection id="empty" title="Empty state & progress">
      <EmptyState
        icon="inventory_2"
        title="No items yet"
        body="Logged items appear here. Use the button to log the first one."
        action={<Button icon="add">Log item</Button>}
      />
      <Specimen label="indeterminate">
        <div className="gallery-wide"><LinearProgress label="Loading items" /></div>
      </Specimen>
      <Specimen label="determinate 40%">
        <div className="gallery-wide"><LinearProgress value={0.4} label="Upload progress" /></div>
      </Specimen>
    </GallerySection>
  );
}

export function OverlaysGallery() {
  const snackbar = useSnackbar();
  const [open, setOpen] = useState<null | 'plain' | 'destructive' | 'form'>(null);
  const [note, setNote] = useState('');
  const close = () => setOpen(null);
  return (
    <GallerySection id="overlays" title="Dialogs & snackbars">
      <Specimen label="Dialog">
        <Button variant="tonal" onClick={() => setOpen('plain')}>Open dialog</Button>
        <Button variant="outlined" onClick={() => setOpen('destructive')}>Destructive dialog</Button>
        <Button variant="outlined" onClick={() => setOpen('form')}>Dialog with field</Button>
      </Specimen>
      <Specimen label="Snackbar">
        <Button variant="tonal" onClick={() => snackbar.show('Item saved')}>Show snackbar</Button>
        <Button variant="outlined" onClick={() => snackbar.show('Item moved to bin B-3', { actionLabel: 'Undo', onAction: () => snackbar.show('Undone') })}>
          With action
        </Button>
        <Button variant="text" onClick={() => snackbar.show('Could not reach the server', { kind: 'error' })}>Error</Button>
      </Specimen>
      <Dialog open={open === 'plain'} title="Release item?" icon="task_alt" confirmLabel="Release" cancelLabel="Cancel" onConfirm={close} onClose={close}>
        The claimant&apos;s ID has been checked. This cannot be undone.
      </Dialog>
      <Dialog open={open === 'destructive'} title="Dispose 4 items?" icon="delete_sweep" confirmLabel="Dispose" cancelLabel="Cancel" destructive onConfirm={close} onClose={close}>
        These items are past their retention period.
      </Dialog>
      <Dialog open={open === 'form'} title="Deny claim" confirmLabel="Deny" cancelLabel="Cancel" onConfirm={close} onClose={close}>
        <TextField label="Reason" value={note} onChange={setNote} multiline supportingText="Sent to the claimant" />
      </Dialog>
    </GallerySection>
  );
}

export function PageHeaderGallery() {
  return (
    <GallerySection id="page-header" title="Page header" note="headline-small (headline-medium ≥ 840px); title is the page h1.">
      <div className="gallery-frame">
        <PageHeader documentTitle={false} title="Claim #1042" subtitle="Submitted 2 hours ago" back="/staff/claims" actions={<Button variant="tonal" icon="print">Print</Button>} />
      </div>
    </GallerySection>
  );
}
