import type { Color } from '../colors';

/** What the local vision model suggests for the intake form. Every part is optional; staff review before saving. */
export interface VisionSuggestion {
  category?: string;
  /** Short public name for the item heading ("iPhone", "AirPods case"). */
  name?: string;
  color?: Color;
  /** Category field values keyed by field name (only fields of the suggested category, already validated). */
  fields: Record<string, string>;
  /** One-line human description, shown to staff (not stored). */
  summary?: string;
}

export interface VisionStatus {
  enabled: boolean;
  reachable: boolean;
  model: string;
}
