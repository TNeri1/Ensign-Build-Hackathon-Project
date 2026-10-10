import { z } from 'zod';

export const claimAnswersSchema = z.object({
  /** Keyed by challenge field name. */
  answers: z.record(z.string().trim().min(1).max(300)),
});
export type ClaimAnswersInput = z.infer<typeof claimAnswersSchema>;

/** A visitor starts a claim from the public listing. */
export const startClaimSchema = z.object({ contactEmail: z.string().trim().email() });
export type StartClaimInput = z.infer<typeof startClaimSchema>;

export const claimDecisionSchema = z
  .object({
    decision: z.enum(['approve', 'deny']),
    reason: z.string().trim().max(300).default(''),
  })
  .refine((d) => d.decision === 'approve' || d.reason.length > 0, { message: 'A reason is required to deny a claim', path: ['reason'] });
export type ClaimDecisionInput = z.infer<typeof claimDecisionSchema>;

export const pickupLookupSchema = z.object({ code: z.string().min(10) });
export const pickupReleaseSchema = z.object({
  code: z.string().min(10),
  /** Staff must explicitly confirm they checked the claimant's photo ID. */
  idChecked: z.literal(true),
});

export const PICKUP_PREFIX = 'vlf:pickup:';
/** Accepts a scanned `vlf:pickup:<token>` string or a bare token. */
export function parsePickupCode(code: string): string {
  const c = code.trim();
  return c.startsWith(PICKUP_PREFIX) ? c.slice(PICKUP_PREFIX.length) : c;
}
