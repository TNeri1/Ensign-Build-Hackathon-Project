import { describe, it, expect } from 'vitest';
import { buildRegistry } from '@vlf/shared';
import phone from '../../../../shared/src/categories/defs/phone';
import wallet from '../../../../shared/src/categories/defs/wallet';
import other from '../../../../shared/src/categories/defs/other';
import headphones from '../../../../shared/src/categories/defs/headphones';
import { buildVisionPrompt } from './prompt';
import { normalizeColor, parseModelJson, sanitizeSuggestion } from './sanitize';

const reg = buildRegistry([phone, wallet]);

describe('buildVisionPrompt', () => {
  it('lists every category, field, select option and color', () => {
    const p = buildVisionPrompt(reg);
    expect(p).toContain('"phone" (Phone)');
    expect(p).toContain('"lock_screen" (Lock screen / wallpaper)');
    expect(p).toContain('one of: Apple | Samsung | Google | Motorola | Other');
    expect(p).toContain('"cash_amount" (Approx. cash inside): a number');
    expect(p).toContain('multicolor');
  });
});

describe('buildVisionPrompt with a catch-all', () => {
  it('tells the model to use "other" instead of forcing a wrong category, only when "other" exists', () => {
    expect(buildVisionPrompt(buildRegistry([phone, wallet, other]))).toMatch(/use "other" and make "name" say what it is/);
    expect(buildVisionPrompt(reg)).not.toContain('"other"');
  });
  it('sanitizes an AirPods photo into headphones, or into other with a name', () => {
    const full = buildRegistry([phone, wallet, other, headphones]);
    expect(sanitizeSuggestion({ category: 'headphones', color: 'white', fields: { style: 'earbuds', brand: 'Apple', model: 'AirPods Pro' } }, full))
      .toEqual({ category: 'headphones', color: 'white', fields: { style: 'Earbuds', brand: 'Apple', model: 'AirPods Pro' } });
    expect(sanitizeSuggestion({ category: 'other', name: '  AirPods   case ', color: 'white', fields: { model: 'ignored', brand: 'Apple' } }, buildRegistry([phone, wallet, other])))
      .toEqual({ category: 'other', name: 'AirPods case', color: 'white', fields: { brand: 'Apple' } });
    expect(sanitizeSuggestion({ name: 'x'.repeat(200), fields: {} }, reg).name).toHaveLength(60);
  });
});

describe('parseModelJson', () => {
  it('handles plain, fenced and chatty replies, and rejects junk', () => {
    expect(parseModelJson('{"color":"black"}')).toEqual({ color: 'black' });
    expect(parseModelJson('Sure!\n```json\n{"color": "red"}\n```')).toEqual({ color: 'red' });
    expect(parseModelJson('no json here')).toBeNull();
    expect(parseModelJson('{broken')).toBeNull();
    expect(parseModelJson('[1,2]')).toBeNull();
  });
});

describe('normalizeColor', () => {
  it('maps synonyms and shades onto the allowed colors', () => {
    expect(normalizeColor('Black')).toBe('black');
    expect(normalizeColor('grey')).toBe('gray');
    expect(normalizeColor('dark blue')).toBe('blue');
    expect(normalizeColor('light grey')).toBe('gray');
    expect(normalizeColor('navy')).toBe('blue');
    expect(normalizeColor('chartreuse')).toBeUndefined();
    expect(normalizeColor(42)).toBeUndefined();
  });
});

describe('sanitizeSuggestion', () => {
  it('keeps valid values and coerces select options case-insensitively', () => {
    const s = sanitizeSuggestion({
      category: 'Phone', color: 'Grey', summary: 'A grey iPhone in a clear case',
      fields: { brand: 'apple', model: 'iPhone 14', case_description: 'clear case', damage: 'unknown', bogus: 'x' },
    }, reg);
    expect(s).toEqual({
      category: 'phone', color: 'gray', summary: 'A grey iPhone in a clear case',
      fields: { brand: 'Apple', model: 'iPhone 14', case_description: 'clear case' },
    });
  });

  it('drops invalid select options, non-numeric numbers, and fields of unknown categories', () => {
    expect(sanitizeSuggestion({ category: 'phone', fields: { brand: 'Nokia' } }, reg).fields).toEqual({});
    expect(sanitizeSuggestion({ category: 'wallet', fields: { cash_amount: 'about $40', card_count: 'several', material: 'leather' } }, reg).fields)
      .toEqual({ cash_amount: '40', material: 'Leather' });
    const unknown = sanitizeSuggestion({ category: 'spaceship', color: 'blue', fields: { brand: 'Apple' } }, reg);
    expect(unknown).toEqual({ color: 'blue', fields: {} });
  });

  it('clips long strings and ignores non-object fields', () => {
    const s = sanitizeSuggestion({ category: 'phone', fields: { model: 'x'.repeat(500) }, summary: 'y'.repeat(500) }, reg);
    expect(s.fields.model.length).toBe(120);
    expect(s.summary!.length).toBe(200);
    expect(sanitizeSuggestion({ category: 'phone', fields: 'nope' }, reg).fields).toEqual({});
  });
});
