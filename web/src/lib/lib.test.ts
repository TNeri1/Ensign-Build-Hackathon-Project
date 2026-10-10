import { describe, it, expect } from 'vitest';
import { COLORS } from '@vlf/shared';
import { categoryIcon } from './categoryIcon';
import { colorSwatch, colorLabel } from './itemColor';
import { formatDate, formatDateTime, relativeTime } from './format';
import { ICONS } from '../components/m3/icons';

describe('categoryIcon', () => {
  it('maps known categories to vendored icons and falls back', () => {
    expect(categoryIcon('phone')).toBe('smartphone');
    expect(categoryIcon('spaceship')).toBe('category');
    for (const id of ['phone', 'wallet', 'keys', 'bag', 'clothing', 'id_card', 'payment_card', 'laptop', 'water_bottle', 'headphones']) {
      expect(ICONS[categoryIcon(id)], id).toBeTruthy();
    }
  });
});

describe('itemColor', () => {
  it('has a swatch for every shared color', () => {
    for (const c of COLORS) expect(colorSwatch(c), c).toBeTruthy();
    expect(colorSwatch('chartreuse')).toBeUndefined();
    expect(colorLabel('multicolor')).toBe('Multicolor');
  });
});

describe('format', () => {
  const o = { locale: 'en-US', timeZone: 'UTC' };
  it('formats dates and date-times', () => {
    expect(formatDate('2026-10-09T15:40:00Z', o)).toBe('Oct 9, 2026');
    expect(formatDateTime('2026-10-09T15:40:00Z', o)).toBe('Oct 9, 3:40 PM');
    expect(formatDate('garbage', o)).toBe('');
  });
  it('relative time buckets', () => {
    const now = new Date('2026-10-10T12:00:00Z');
    expect(relativeTime('2026-10-10T11:59:30Z', now, o)).toBe('just now');
    expect(relativeTime('2026-10-10T13:00:00Z', now, o)).toBe('just now');
    expect(relativeTime('2026-10-10T11:55:00Z', now, o)).toBe('5 min ago');
    expect(relativeTime('2026-10-10T09:00:00Z', now, o)).toBe('3 h ago');
    expect(relativeTime('2026-10-09T08:00:00Z', now, o)).toBe('yesterday');
    expect(relativeTime('2026-10-01T08:00:00Z', now, o)).toBe('Oct 1, 2026');
  });
});
