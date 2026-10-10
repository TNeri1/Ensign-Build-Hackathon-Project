import type { AssistState } from '../../pages/staff/usePhotoAssist';
import { Alert } from '../m3/Alert';
import { Button } from '../m3/Button';
import { LinearProgress } from '../m3/LinearProgress';

interface Props {
  state: AssistState;
  model?: string;
  canRun: boolean;
  onRun: () => void;
}

/** Status of "fill from photo" under the photo card: progress, what was filled, or why it failed. */
export function PhotoAssistNote({ state, model, canRun, onRun }: Props) {
  if (state.kind === 'reading') {
    return (
      <div className="photo-assist" aria-live="polite">
        <LinearProgress label="Reading photo" />
        <p className="photo-assist__text md-typescale-body-medium">Reading the photo{model ? ` with ${model}` : ''}…</p>
      </div>
    );
  }
  if (state.kind === 'done') {
    return (
      <Alert kind={state.filled.length ? 'success' : 'info'} title={state.summary ?? 'Photo read'}
        action={canRun ? <Button variant="text" icon="refresh" onClick={onRun}>Read again</Button> : undefined}>
        {state.filled.length
          ? `Filled from photo: ${state.filled.join(', ')}. Check before saving.`
          : 'Nothing new to fill. Everything it could see is already entered.'}
      </Alert>
    );
  }
  if (state.kind === 'error') {
    return (
      <Alert kind="warning" title="Couldn't read the photo"
        action={canRun ? <Button variant="text" icon="refresh" onClick={onRun}>Try again</Button> : undefined}>
        {state.message}
      </Alert>
    );
  }
  return canRun ? <Button variant="tonal" icon="edit" onClick={onRun}>Fill from photo</Button> : null;
}
