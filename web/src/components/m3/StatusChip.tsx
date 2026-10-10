import { Icon } from './Icon';
import type { IconName } from './icons';
import './StatusChip.css';

type Tone = 'secondary' | 'primary' | 'warning' | 'success' | 'neutral' | 'error';

/** Item states (found/stored/...) and claim statuses (open/submitted/...). */
const STATES: Record<string, { tone: Tone; icon: IconName }> = {
  found: { tone: 'secondary', icon: 'travel_explore' },
  stored: { tone: 'primary', icon: 'warehouse' },
  claim_pending: { tone: 'warning', icon: 'hourglass_empty' },
  verified: { tone: 'success', icon: 'verified' },
  released: { tone: 'neutral', icon: 'task_alt' },
  disposed: { tone: 'error', icon: 'delete' },
  open: { tone: 'warning', icon: 'pending' },
  submitted: { tone: 'warning', icon: 'hourglass_empty' },
  approved: { tone: 'success', icon: 'check_circle' },
  denied: { tone: 'error', icon: 'cancel' },
};

/** Human label for a state, e.g. "claim_pending" -> "claim pending". */
export function stateLabel(state: string): string {
  return state.replace(/[_-]+/g, ' ').trim();
}

/** Non-interactive status label for item states and claim statuses. */
export function StatusChip({ state }: { state: string }) {
  const def = STATES[state] ?? { tone: 'neutral' as Tone, icon: 'label' as IconName };
  return (
    <span className={`md-status-chip md-status-chip--${def.tone}`} data-state={state}>
      <Icon name={def.icon} size={16} className="md-status-chip__icon" />
      <span className="md-status-chip__label">{stateLabel(state)}</span>
    </span>
  );
}
