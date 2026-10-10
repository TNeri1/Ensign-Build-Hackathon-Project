import { COLORS, ITEM_NAME_MAX, type CategoryRegistry, type Color, type VisionSuggestion } from '@vlf/shared';

/** Pull the first JSON object out of a model reply (handles ```json fences and chatter around it). */
export function parseModelJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const v: unknown = JSON.parse(text.slice(start, end + 1));
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const COLOR_ALIASES: Record<string, Color> = {
  grey: 'gray', charcoal: 'gray', navy: 'blue', teal: 'blue', turquoise: 'blue', cyan: 'blue', beige: 'brown', tan: 'brown',
  maroon: 'red', burgundy: 'red', violet: 'purple', lilac: 'purple', rose: 'pink', golden: 'gold', metallic: 'silver',
  'multi-colored': 'multicolor', multicolored: 'multicolor', 'multi-color': 'multicolor', multi: 'multicolor', colorful: 'multicolor',
};

export function normalizeColor(v: unknown): Color | undefined {
  if (typeof v !== 'string') return undefined;
  const c = v.trim().toLowerCase();
  if ((COLORS as readonly string[]).includes(c)) return c as Color;
  if (COLOR_ALIASES[c]) return COLOR_ALIASES[c];
  // "dark blue", "light grey" -> last word
  const last = c.split(/[\s-]+/).pop() ?? '';
  return (COLORS as readonly string[]).includes(last) ? (last as Color) : COLOR_ALIASES[last];
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n).trim() : s);
const lc = (s: string) => s.trim().toLowerCase();

/**
 * Turn an untrusted model reply into a safe suggestion: known category, allowed color,
 * only that category's fields, select values matched to real options, numbers numeric, short strings.
 */
export function sanitizeSuggestion(raw: Record<string, unknown>, reg: CategoryRegistry): VisionSuggestion {
  const out: VisionSuggestion = { fields: {} };
  const catRaw = typeof raw.category === 'string' ? lc(raw.category) : '';
  const def = reg.all().find((c) => c.id === catRaw || lc(c.label) === catRaw);
  if (def) out.category = def.id;

  const color = normalizeColor(raw.color);
  if (color) out.color = color;

  const fields = raw.fields && typeof raw.fields === 'object' ? (raw.fields as Record<string, unknown>) : {};
  if (def) {
    for (const f of def.fields) {
      const v = fields[f.name];
      if (v === null || v === undefined) continue;
      const str = String(v).trim();
      if (!str || /^(unknown|n\/a|none|not visible)$/i.test(str)) continue;
      if (f.type === 'select') {
        const opt = f.options?.find((o) => lc(o) === lc(str));
        if (opt) out.fields[f.name] = opt;
      } else if (f.type === 'number') {
        const n = Number(str.replace(/[^0-9.]/g, ''));
        if (str.match(/\d/) && Number.isFinite(n)) out.fields[f.name] = String(n);
      } else {
        out.fields[f.name] = clip(str, 120);
      }
    }
  }
  if (typeof raw.name === 'string' && raw.name.trim()) out.name = clip(raw.name.trim().replace(/\s+/g, ' '), ITEM_NAME_MAX);
  if (typeof raw.summary === 'string' && raw.summary.trim()) out.summary = clip(raw.summary.trim(), 200);
  return out;
}
