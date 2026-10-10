import { z } from 'zod';
import { COLORS } from '../colors';

/** JSON part of the multipart intake request (photo travels as a separate file part). */
export const intakeSchema = z.object({
  category: z.string().min(1),
  color: z.enum(COLORS),
  foundArea: z.string().trim().min(1).max(120),
  /** ISO timestamp; defaults to now on the server. */
  foundAt: z.string().datetime().optional(),
  binId: z.string().optional(),
  /** Category-specific field values keyed by field name. */
  fields: z.record(z.string()).default({}),
});
export type IntakeInput = z.infer<typeof intakeSchema>;

export const binCreateSchema = z.object({
  code: z.string().trim().regex(/^[A-Za-z0-9-]{1,12}$/, 'letters, digits, dashes (max 12)'),
  label: z.string().trim().min(1).max(60),
});
export type BinCreateInput = z.infer<typeof binCreateSchema>;
