import type { VisionSuggestion } from '@vlf/shared';
import type { AppContext } from '../../context';
import { AppError } from '../../errors';
import { askVisionModel, visionEnabled } from './client';
import { buildVisionPrompt } from './prompt';
import { parseModelJson, sanitizeSuggestion } from './sanitize';

export const VISION_MIME = ['image/jpeg', 'image/png', 'image/webp'];

/** Photo in, validated form suggestion out. The photo never leaves the machine running the local model. */
export async function describePhoto(ctx: AppContext, data: Buffer, mimetype: string): Promise<VisionSuggestion> {
  if (!visionEnabled(ctx.config)) throw new AppError(503, 'Reading photos is turned off on this server.', 'vision_off');
  if (!VISION_MIME.includes(mimetype)) throw new AppError(400, 'Photo must be JPEG, PNG or WebP', 'bad_request');
  const reply = await askVisionModel(ctx.config, buildVisionPrompt(ctx.categories), `data:${mimetype};base64,${data.toString('base64')}`);
  const raw = parseModelJson(reply);
  if (!raw) throw new AppError(502, 'Could not understand the vision model reply. Fill the form by hand.', 'vision_error');
  return sanitizeSuggestion(raw, ctx.categories);
}
