import { describe, it, expect } from 'vitest';
import { buildRegistry, buildChallenges, resolveAttributes } from '../registry';
import def from './water_bottle';

describe('water_bottle category', () => {
  it('registers with the expected flags', () => {
    const reg = buildRegistry([def]);
    expect(reg.get('water_bottle')).toMatchObject({ sensitive: false, retentionDays: 45 });
  });
  it('rejects a submission missing a required field', () => {
    const required = def.fields.filter((f) => f.required);
    expect(resolveAttributes(def, {}).errors).toHaveLength(required.length);
  });
  it('builds a challenge for each private field that has a template', () => {
    const priv = Object.fromEntries(def.fields.filter((f) => !f.public).map((f) => [f.name, 'x']));
    expect(buildChallenges(def, priv).map((c) => c.field)).toEqual(def.challengeTemplates.map((t) => t.field));
  });
  it('never asks about public fields', () => {
    const publicNames = new Set(def.fields.filter((f) => f.public).map((f) => f.name));
    expect(def.challengeTemplates.every((t) => !publicNames.has(t.field))).toBe(true);
  });
});
