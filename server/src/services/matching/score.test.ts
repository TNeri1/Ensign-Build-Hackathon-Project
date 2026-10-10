import { describe, it, expect } from 'vitest';
import { scoreMatch, areaFactor, timeFactor, defaultMatchConfig, HOUR } from './score';

const cfg = defaultMatchConfig(60);
const report = { category: 'phone', color: 'black', area: 'Gate 3', window_start: '2026-06-01T10:00:00Z', window_end: '2026-06-01T14:00:00Z' };
const item = { category: 'phone', color: 'black', found_area: 'Gate 3', found_at: '2026-06-01T12:00:00Z' };

describe('scoreMatch', () => {
  it('perfect match scores 100', () => {
    const r = scoreMatch(report, item, cfg);
    expect(r.score).toBe(100);
    expect(r.isMatch).toBe(true);
  });
  it('different category never matches', () => {
    const r = scoreMatch(report, { ...item, category: 'wallet' }, cfg);
    expect(r).toMatchObject({ score: 0, isMatch: false });
  });
  it('wrong color loses only color points', () => {
    const r = scoreMatch(report, { ...item, color: 'white' }, cfg);
    expect(r.score).toBe(80);
    expect(r.breakdown.color).toBe(0);
  });
  it('category alone (40) is below the threshold', () => {
    const r = scoreMatch(report, { category: 'phone', color: 'red', found_area: 'Parking', found_at: '2026-06-03T12:00:00Z' }, cfg);
    expect(r).toMatchObject({ score: 40, isMatch: false });
  });
  it('category + color + partial area + out-of-window time is 70 and matches', () => {
    const r = scoreMatch(
      { ...report, area: 'Gate 3 entrance' },
      { ...item, found_area: 'Gate 3 lobby', found_at: '2026-06-02T12:00:00Z' },
      cfg,
    );
    expect(r.score).toBe(70); // 40 + 20 + 10 + 0
    expect(r.isMatch).toBe(true);
  });
  it('category + color alone (60) does not reach the default threshold of 70', () => {
    const r = scoreMatch(report, { ...item, found_area: 'Parking', found_at: '2026-06-09T12:00:00Z' }, defaultMatchConfig());
    expect(r).toMatchObject({ score: 60, isMatch: false });
  });
  it('threshold is configurable', () => {
    const strict = { ...cfg, threshold: 95 };
    expect(scoreMatch(report, { ...item, color: 'white' }, strict).isMatch).toBe(false);
  });
});

describe('areaFactor', () => {
  it('handles case, stopwords, partial overlap and no overlap', () => {
    expect(areaFactor('Gate 3', 'gate 3')).toBe(1);
    expect(areaFactor('near the Gate 3', 'Gate 3')).toBe(1);
    expect(areaFactor('Gate 3 entrance', 'Gate 3 lobby')).toBe(0.5);
    expect(areaFactor('Gate 3', 'Gate 7')).toBe(0);
    expect(areaFactor('Section 112', 'Section 112 upper')).toBe(0.5);
    expect(areaFactor('Food Court', 'Parking')).toBe(0);
    expect(areaFactor('', 'Gate 3')).toBe(0);
  });
});

describe('timeFactor', () => {
  const s = '2026-06-01T10:00:00Z';
  const e = '2026-06-01T14:00:00Z';
  it('full inside, half within tolerance, zero beyond', () => {
    expect(timeFactor('2026-06-01T10:00:00Z', s, e, 3 * HOUR)).toBe(1);
    expect(timeFactor('2026-06-01T16:00:00Z', s, e, 3 * HOUR)).toBe(0.5);
    expect(timeFactor('2026-06-01T08:00:00Z', s, e, 3 * HOUR)).toBe(0.5);
    expect(timeFactor('2026-06-01T20:00:00Z', s, e, 3 * HOUR)).toBe(0);
    expect(timeFactor('garbage', s, e, 3 * HOUR)).toBe(0);
  });
});
