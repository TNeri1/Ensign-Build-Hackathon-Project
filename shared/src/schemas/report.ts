import { z } from 'zod';
import { COLORS } from '../colors';

export const lostReportSchema = z
  .object({
    category: z.string().min(1),
    color: z.enum(COLORS),
    area: z.string().trim().min(1).max(120),
    windowStart: z.string().datetime(),
    windowEnd: z.string().datetime(),
    description: z.string().trim().max(500).default(''),
    contactEmail: z.string().email(),
  })
  .refine((r) => Date.parse(r.windowEnd) >= Date.parse(r.windowStart), { message: 'windowEnd must be after windowStart', path: ['windowEnd'] });
export type LostReportInput = z.infer<typeof lostReportSchema>;
