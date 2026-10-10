import type { ShapeName, ShapeTone } from '../m3/ExpressiveShape';
import type { IconName } from '../m3/icons';

/** Expressive shape, tone and icon per item state (custody timeline nodes, summary accents). */
const STATE: Record<string, { shape: ShapeName; tone: ShapeTone; icon: IconName }> = {
  found: { shape: 'cookie', tone: 'secondary', icon: 'travel_explore' },
  stored: { shape: 'soft-square', tone: 'primary', icon: 'warehouse' },
  claim_pending: { shape: 'clover', tone: 'warning', icon: 'hourglass_empty' },
  verified: { shape: 'flower', tone: 'success', icon: 'verified' },
  released: { shape: 'sunny', tone: 'tertiary', icon: 'task_alt' },
  disposed: { shape: 'puffy', tone: 'error', icon: 'delete' },
};

export function stateStyle(state: string): { shape: ShapeName; tone: ShapeTone; icon: IconName } {
  return STATE[state] ?? { shape: 'circle', tone: 'surface', icon: 'history' };
}
