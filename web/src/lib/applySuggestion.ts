import type { VisionSuggestion } from '@vlf/shared';
import type { CategoryInfo } from '../api/types';

export interface IntakeDraft {
  category: string;
  color: string;
  fields: Record<string, string>;
}

/**
 * Merge a photo suggestion into the intake form WITHOUT overwriting anything staff already entered:
 * - category is only set when empty; fields are only applied when the suggestion's category is the form's category;
 * - color and each field are only filled when empty.
 * Returns the new draft plus human labels of what was filled (for the "filled from photo" note).
 */
export function applySuggestion(draft: IntakeDraft, s: VisionSuggestion, cats: CategoryInfo[]): { draft: IntakeDraft; filled: string[] } {
  const filled: string[] = [];
  let { category, color } = draft;
  let fields = draft.fields;

  if (!category && s.category && cats.some((c) => c.id === s.category)) {
    category = s.category;
    fields = {};
    filled.push('Category');
  }
  if (!color && s.color) {
    color = s.color;
    filled.push('Color');
  }
  const def = cats.find((c) => c.id === category);
  if (def && s.category === category) {
    const next = { ...fields };
    for (const f of def.fields) {
      const v = s.fields[f.name];
      if (v && !(next[f.name] ?? '').trim()) {
        next[f.name] = v;
        filled.push(f.label);
      }
    }
    fields = next;
  }
  return { draft: { category, color, fields }, filled };
}
