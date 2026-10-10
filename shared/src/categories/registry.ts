import { categoryDefinitionSchema, type CategoryDefinition, type ChallengeTemplate } from './schema';

export interface CategoryRegistry {
  all(): CategoryDefinition[];
  get(id: string): CategoryDefinition | undefined;
  has(id: string): boolean;
}

/** Build a registry from already-imported definitions. Validates each and rejects duplicate ids. */
export function buildRegistry(defs: unknown[]): CategoryRegistry {
  const map = new Map<string, CategoryDefinition>();
  for (const raw of defs) {
    const def = categoryDefinitionSchema.parse(raw);
    if (map.has(def.id)) throw new Error(`Duplicate category id: ${def.id}`);
    map.set(def.id, def);
  }
  const sorted = [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  return { all: () => sorted, get: (id) => map.get(id), has: (id) => map.has(id) };
}

export interface AttributeInput {
  key: string;
  value: string;
  isPublic: boolean;
}

/** Validate submitted field values against a category and return attribute rows. */
export function resolveAttributes(
  def: CategoryDefinition,
  values: Record<string, string | undefined>,
): { attributes: AttributeInput[]; errors: string[] } {
  const errors: string[] = [];
  const attributes: AttributeInput[] = [];
  for (const f of def.fields) {
    const v = (values[f.name] ?? '').trim();
    if (!v) {
      if (f.required) errors.push(`${f.label} is required`);
      continue;
    }
    if (f.type === 'select' && !f.options?.includes(v)) errors.push(`${f.label} must be one of: ${f.options?.join(', ')}`);
    if (f.type === 'number' && Number.isNaN(Number(v))) errors.push(`${f.label} must be a number`);
    attributes.push({ key: f.name, value: v, isPublic: f.public });
  }
  return { attributes, errors };
}

export interface Challenge {
  field: string;
  question: string;
  match: ChallengeTemplate['match'];
}

/** Questions for every template whose private field has a recorded value. */
export function buildChallenges(def: CategoryDefinition, privateValues: Record<string, string>): Challenge[] {
  return def.challengeTemplates
    .filter((t) => (privateValues[t.field] ?? '').trim() !== '')
    .map((t) => ({ field: t.field, question: t.question, match: t.match }));
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function checkAnswer(match: Challenge['match'], expected: string, given: string): boolean {
  const e = normalize(expected);
  const g = normalize(given);
  if (!e || !g) return false;
  if (match === 'exact') return e === g;
  return g.includes(e) || (g.length >= 4 && ` ${e} `.includes(` ${g} `));
}
