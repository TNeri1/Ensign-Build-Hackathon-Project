import { describe, it, expect } from 'vitest';
import type { CategoryInfo } from '../api/types';
import { applySuggestion } from './applySuggestion';
import { fitWithin } from './downscaleImage';

const cats: CategoryInfo[] = [
  { id: 'phone', label: 'Phone', sensitive: false, nameRequired: false, fields: [
    { name: 'brand', label: 'Brand', type: 'select', options: ['Apple', 'Other'], public: true, required: true },
    { name: 'model', label: 'Model', type: 'text', public: false, required: true },
  ] },
  { id: 'wallet', label: 'Wallet', sensitive: true, nameRequired: false, fields: [{ name: 'material', label: 'Material', type: 'text', public: true, required: true }] },
];
const s = { category: 'phone', name: 'iPhone', color: 'black' as const, fields: { brand: 'Apple', model: 'iPhone 14' }, summary: 'Black iPhone' };

describe('applySuggestion', () => {
  it('fills an empty form completely', () => {
    const r = applySuggestion({ category: '', name: '', color: '', fields: {} }, s, cats);
    expect(r.draft).toEqual({ category: 'phone', name: 'iPhone', color: 'black', fields: { brand: 'Apple', model: 'iPhone 14' } });
    expect(r.filled).toEqual(['Category', 'Item name', 'Color', 'Brand', 'Model']);
  });
  it('never overwrites what staff entered', () => {
    expect(applySuggestion({ category: 'phone', name: 'My label', color: 'red', fields: {} }, s, cats).draft.name).toBe('My label');
    const r = applySuggestion({ category: 'phone', name: '', color: 'red', fields: { model: 'Pixel 8' } }, s, cats);
    expect(r.draft).toEqual({ category: 'phone', name: 'iPhone', color: 'red', fields: { model: 'Pixel 8', brand: 'Apple' } });
    expect(r.filled).toEqual(['Item name', 'Brand']);
  });
  it('keeps a different category chosen by staff and ignores the other category fields', () => {
    const r = applySuggestion({ category: 'wallet', name: '', color: '', fields: {} }, s, cats);
    expect(r.draft).toEqual({ category: 'wallet', name: 'iPhone', color: 'black', fields: {} });
    expect(r.filled).toEqual(['Item name', 'Color']);
  });
  it('ignores unknown categories', () => {
    expect(applySuggestion({ category: '', name: '', color: '', fields: {} }, { category: 'boat', fields: {} }, cats).draft.category).toBe('');
  });
});

describe('fitWithin', () => {
  it('scales the long side down and never up', () => {
    expect(fitWithin(4000, 3000, 1024)).toEqual({ width: 1024, height: 768 });
    expect(fitWithin(3000, 4000, 1024)).toEqual({ width: 768, height: 1024 });
    expect(fitWithin(800, 600, 1024)).toEqual({ width: 800, height: 600 });
  });
});
