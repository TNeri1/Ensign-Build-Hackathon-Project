/**
 * Compares a claimant's answer with the private record. ADVISORY ONLY: staff always see both answers and decide.
 * Deterministic and offline. Tolerates what people naturally do when answering from memory:
 *  - typos ("assosiation" ~ "association"): one edit for words of 5+ letters, two for 8+; short words stay exact;
 *  - word forms ("guides" ~ "guide", "cracked" ~ "crack"): simple suffix stemming;
 *  - leaving out filler staff tend to record ("logo", "sticker", "decal", "color", ...).
 * Numbers must match exactly ("iPhone 13" never matches "iPhone 14").
 */

export type AnswerVerdict = 'match' | 'close' | 'differs';
export type MatchMode = 'exact' | 'contains';

export interface AnswerScore {
  verdict: AnswerVerdict;
  /** Share of the recorded value's meaningful words found in the answer (0-1). */
  score: number;
}

const STOP = new Set(['a', 'an', 'the', 'with', 'on', 'in', 'of', 'and', 'at', 'is', 'it', 'its', 'has', 'have', 'to', 'my', 'was', 'were', 'there', 'some', 'from', 'for', 'or', 'i', 'think', 'maybe', 'like']);
/** Descriptive words that carry no identity on their own. Dropped from both sides. */
const FILLER = new Set(['logo', 'sticker', 'decal', 'picture', 'image', 'photo', 'print', 'design', 'color', 'colour', 'colored', 'coloured', 'thing', 'one', 'kind', 'type', 'side', 'front', 'back']);

const normalize = (s: string) => s.toLowerCase().replace(/[’']s\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const isNum = (t: string) => /^\d+$/.test(t);

/** Light suffix stemming: enough for plurals and -ed/-ing, never touching numbers or short words. */
function stemOnce(t: string): string {
  if (isNum(t) || t.length <= 3) return t;
  if (t.length > 4 && t.endsWith('ies')) return `${t.slice(0, -3)}y`;
  if (t.length > 5 && t.endsWith('ing')) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith('ed')) return t.slice(0, -2);
  if (t.length > 4 && /(s|x|z|ch|sh)es$/.test(t)) return t.slice(0, -2);
  if (t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1);
  return t;
}

/** Stem until stable, so both "drawings" and "drawing" reduce to "draw". */
export function stem(t: string): string {
  let prev = '';
  let cur = t;
  while (cur !== prev) {
    prev = cur;
    cur = stemOnce(cur);
  }
  return cur;
}

/** Optimal string alignment distance (Levenshtein + adjacent swaps), stopping early once above `max`. */
export function editDistance(a: string, b: string, max = Infinity): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

/** Same word, allowing small typos on longer words. Numbers compare by value. */
export function wordsMatch(a: string, b: string): boolean {
  if (isNum(a) || isNum(b)) return isNum(a) && isNum(b) && Number(a) === Number(b);
  const x = stem(a);
  const y = stem(b);
  if (x === y) return true;
  const len = Math.min(x.length, y.length);
  const allowed = len >= 8 ? 2 : len >= 5 ? 1 : 0;
  return allowed > 0 && editDistance(x, y, allowed) <= allowed;
}

function words(s: string): string[] {
  const all = normalize(s).split(' ').filter((t) => t && !STOP.has(t));
  const meaningful = all.filter((t) => !FILLER.has(t));
  return [...new Set(meaningful.length ? meaningful : all)];
}

export function scoreAnswer(mode: MatchMode, expected: string, given: string): AnswerScore {
  const e = words(expected);
  const g = words(given);
  if (!e.length || !g.length) return { verdict: 'differs', score: 0 };

  if (mode === 'exact') {
    // Same words in the same order; numbers by value ("$40" = "40", "05" = "5"). Codes get no typo tolerance.
    const ne = normalize(expected).split(' ').filter(Boolean);
    const ng = normalize(given).split(' ').filter(Boolean);
    const same = ne.length === ng.length && ne.every((t, i) => (isNum(t) && isNum(ng[i]) ? Number(t) === Number(ng[i]) : t === ng[i]));
    return same ? { verdict: 'match', score: 1 } : { verdict: 'differs', score: 0 };
  }

  // A recorded word counts when it matches an answer word, or when it is half of a compound written as
  // one word on the other side ("gift card" ~ "giftcard", "back pack" ~ "backpack").
  const gPairs = g.slice(1).map((u, i) => g[i] + u);
  const hit = e.map((t) => g.some((u) => wordsMatch(t, u)) || gPairs.some((u) => wordsMatch(t, u)));
  e.forEach((t, i) => {
    if (i + 1 < e.length && !(hit[i] && hit[i + 1]) && g.some((u) => wordsMatch(t + e[i + 1], u))) hit[i] = hit[i + 1] = true;
  });
  const hits = hit.filter(Boolean).length;
  const score = hits / e.length;
  const missingNumber = e.some((t) => isNum(t) && !g.some((u) => isNum(u) && Number(u) === Number(t)));
  if (missingNumber) return { verdict: 'differs', score };
  const need = e.length <= 2 ? e.length : Math.ceil(e.length * 0.6);
  if (hits >= need) return { verdict: 'match', score };
  if (hits > 0 && score >= 1 / 3 - 1e-9) return { verdict: 'close', score };
  return { verdict: 'differs', score };
}

/** True only for a full match (kept for existing callers; prefer scoreAnswer for the three-level verdict). */
export function checkAnswer(mode: MatchMode, expected: string, given: string): boolean {
  return scoreAnswer(mode, expected, given).verdict === 'match';
}
