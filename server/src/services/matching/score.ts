/** Deterministic, pure matching. No DB access here; see run.ts for the wiring. */

export interface MatchWeights {
  category: number;
  color: number;
  area: number;
  time: number;
}

export interface MatchConfig {
  weights: MatchWeights;
  /** Minimum total score (0-100) that counts as a match. */
  threshold: number;
  /** A found-time this close outside the report window earns half the time points. */
  timeToleranceMs: number;
}

export const DEFAULT_WEIGHTS: MatchWeights = { category: 40, color: 20, area: 20, time: 20 };
export const HOUR = 3_600_000;

export function defaultMatchConfig(threshold = 70): MatchConfig {
  return { weights: DEFAULT_WEIGHTS, threshold, timeToleranceMs: 3 * HOUR };
}

export interface ReportLike { category: string; color: string; area: string; window_start: string; window_end: string }
export interface ItemLike { category: string; color: string; found_area: string; found_at: string }

export interface MatchResult {
  score: number;
  breakdown: MatchWeights;
  isMatch: boolean;
}

const STOP = new Set(['the', 'a', 'an', 'at', 'near', 'by', 'of', 'in', 'on', 'area', 'zone']);
const tokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t && !STOP.has(t));

/** Same words = 1; at least half the words shared (Jaccard) = 0.5; otherwise 0. "Gate 3" vs "Gate 7" = 0. */
export function areaFactor(a: string, b: string): number {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (!ta.size || !tb.size) return 0;
  const shared = [...ta].filter((t) => tb.has(t)).length;
  if (shared === ta.size && shared === tb.size) return 1;
  return shared / (ta.size + tb.size - shared) >= 0.5 ? 0.5 : 0;
}

/** Found time inside the window = 1; within tolerance of it = 0.5; else 0. */
export function timeFactor(foundAt: string, start: string, end: string, toleranceMs: number): number {
  const t = Date.parse(foundAt);
  const s = Date.parse(start);
  const e = Date.parse(end);
  if ([t, s, e].some(Number.isNaN)) return 0;
  if (t >= s && t <= e) return 1;
  const gap = t < s ? s - t : t - e;
  return gap <= toleranceMs ? 0.5 : 0;
}

/** Category is a hard gate: a different category never matches, whatever else lines up. */
export function scoreMatch(report: ReportLike, item: ItemLike, cfg: MatchConfig): MatchResult {
  const w = cfg.weights;
  const zero = { category: 0, color: 0, area: 0, time: 0 };
  if (report.category !== item.category) return { score: 0, breakdown: zero, isMatch: false };
  const breakdown: MatchWeights = {
    category: w.category,
    color: report.color === item.color ? w.color : 0,
    area: w.area * areaFactor(report.area, item.found_area),
    time: w.time * timeFactor(item.found_at, report.window_start, report.window_end, cfg.timeToleranceMs),
  };
  const score = breakdown.category + breakdown.color + breakdown.area + breakdown.time;
  return { score, breakdown, isMatch: score >= cfg.threshold };
}
