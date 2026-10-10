import { describe, it, expect } from 'vitest';
import { buildRegistry, resolveAttributes, buildChallenges, checkAnswer } from './registry';
import { categoryDefinitionSchema } from './schema';
import phone from './defs/phone';
import wallet from './defs/wallet';

describe('category schema', () => {
  const base = { id: 'x', label: 'X', sensitive: false, retentionDays: 30 };
  it('rejects a challenge on a public field', () => {
    const r = categoryDefinitionSchema.safeParse({
      ...base,
      fields: [{ name: 'brand', label: 'Brand', public: true }],
      challengeTemplates: [{ field: 'brand', question: 'What brand is it?' }],
    });
    expect(r.success).toBe(false);
  });
  it('rejects a challenge on an unknown field', () => {
    const r = categoryDefinitionSchema.safeParse({
      ...base,
      fields: [{ name: 'a', label: 'A', public: false }],
      challengeTemplates: [{ field: 'zzz', question: 'What is zzz here?' }],
    });
    expect(r.success).toBe(false);
  });
  it('requires options on select fields', () => {
    const r = categoryDefinitionSchema.safeParse({
      ...base,
      fields: [{ name: 'a', label: 'A', type: 'select', public: false }],
      challengeTemplates: [{ field: 'a', question: 'What is a here?' }],
    });
    expect(r.success).toBe(false);
  });
});

describe('registry', () => {
  it('registers reference categories and rejects duplicates', () => {
    const reg = buildRegistry([phone, wallet]);
    expect(reg.all().map((c) => c.id)).toEqual(['phone', 'wallet']);
    expect(reg.get('wallet')?.sensitive).toBe(true);
    expect(() => buildRegistry([phone, phone])).toThrow(/Duplicate/);
  });
});

describe('resolveAttributes', () => {
  it('flags public/private and reports missing required fields', () => {
    const ok = resolveAttributes(phone, { brand: 'Apple', model: 'iPhone 14' });
    expect(ok.errors).toEqual([]);
    expect(ok.attributes).toEqual([
      { key: 'brand', value: 'Apple', isPublic: true },
      { key: 'model', value: 'iPhone 14', isPublic: false },
    ]);
    expect(resolveAttributes(phone, { brand: 'Apple' }).errors).toEqual(['Model is required']);
    expect(resolveAttributes(phone, { brand: 'Nokia', model: 'x' }).errors[0]).toMatch(/one of/);
  });
});

describe('challenges', () => {
  it('only asks about fields that have recorded values', () => {
    const c = buildChallenges(phone, { model: 'iPhone 14', lock_screen: 'dog on beach' });
    expect(c.map((x) => x.field)).toEqual(['model', 'lock_screen']);
  });
  it('matches answers leniently for contains and strictly for exact', () => {
    expect(checkAnswer('contains', 'a golden retriever on a beach', 'Golden retriever!')).toBe(true);
    expect(checkAnswer('contains', 'a golden retriever on a beach', 'ret')).toBe(false);
    expect(checkAnswer('contains', 'golden retriever', 'a Golden Retriever on beach')).toBe(true);
    expect(checkAnswer('exact', '40', ' 40 ')).toBe(true);
    expect(checkAnswer('exact', '40', '400')).toBe(false);
    expect(checkAnswer('contains', 'iPhone 14', '')).toBe(false);
    expect(checkAnswer('contains', 'clear case with a green sticker', 'Clear case, green sticker on the back')).toBe(true);
    expect(checkAnswer('contains', 'iPhone 14', 'iPhone 13')).toBe(false);
    expect(checkAnswer('contains', 'iPhone 14', 'an iPhone 14 Pro')).toBe(true);
    expect(checkAnswer('contains', 'golden retriever on a beach', 'a dog on a beach')).toBe(false);
  });
});
