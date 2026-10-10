import { z } from 'zod';

const slug = z.string().regex(/^[a-z][a-z0-9_]*$/, 'lowercase letters, digits, underscores');

export const fieldSchema = z.object({
  name: slug,
  label: z.string().min(1),
  type: z.enum(['text', 'select', 'number']).default('text'),
  options: z.array(z.string().min(1)).optional(),
  /** Public fields appear in the redacted public listing. Everything else is private. */
  public: z.boolean(),
  required: z.boolean().default(false),
});

export const challengeTemplateSchema = z.object({
  /** Name of a PRIVATE field in the same category. */
  field: slug,
  question: z.string().min(5),
  /** exact: normalized equality. contains: expected value must appear in the answer (or vice versa). */
  match: z.enum(['exact', 'contains']).default('contains'),
});

export const categoryDefinitionSchema = z
  .object({
    id: slug,
    label: z.string().min(1),
    fields: z.array(fieldSchema).min(1),
    challengeTemplates: z.array(challengeTemplateSchema).min(1),
    /** Sensitive categories (IDs, payment cards): photos staff-only and blurred. */
    sensitive: z.boolean(),
    retentionDays: z.number().int().positive(),
  })
  .superRefine((def, ctx) => {
    const byName = new Map(def.fields.map((f) => [f.name, f]));
    if (byName.size !== def.fields.length) ctx.addIssue({ code: 'custom', message: 'duplicate field names' });
    for (const f of def.fields) {
      if (f.type === 'select' && !f.options?.length) {
        ctx.addIssue({ code: 'custom', message: `select field "${f.name}" needs options` });
      }
    }
    for (const t of def.challengeTemplates) {
      const f = byName.get(t.field);
      if (!f) ctx.addIssue({ code: 'custom', message: `challenge references unknown field "${t.field}"` });
      else if (f.public) ctx.addIssue({ code: 'custom', message: `challenge field "${t.field}" must be private` });
    }
  });

export type FieldDef = z.infer<typeof fieldSchema>;
export type ChallengeTemplate = z.infer<typeof challengeTemplateSchema>;
export type CategoryDefinition = z.infer<typeof categoryDefinitionSchema>;
/** Use in category files: `export default defineCategory({...})` gives type-checking and validation. */
export type CategoryInput = z.input<typeof categoryDefinitionSchema>;
export function defineCategory(input: CategoryInput): CategoryDefinition {
  return categoryDefinitionSchema.parse(input);
}
