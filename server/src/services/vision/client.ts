import type { Config } from '../../config';
import { AppError } from '../../errors';

type VisionConfig = Pick<Config, 'visionUrl' | 'visionModel' | 'visionTimeoutMs'>;

export const visionEnabled = (c: VisionConfig) => c.visionUrl !== '' && c.visionUrl.toLowerCase() !== 'off';

const unavailable = (c: VisionConfig, why: string) =>
  new AppError(503, `No local vision model answered at ${c.visionUrl} (${why}). Start one (see README) or fill the form by hand.`, 'vision_unavailable');

async function post(c: VisionConfig, body: unknown): Promise<Response> {
  try {
    return await fetch(`${c.visionUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(c.visionTimeoutMs),
    });
  } catch (e) {
    throw unavailable(c, (e as Error).name === 'TimeoutError' ? 'timed out' : 'not reachable');
  }
}

/**
 * Ask an OpenAI-compatible local server (Ollama, LM Studio, llama.cpp, vLLM) about one image.
 * Returns the raw text reply. Retries once without response_format for servers that reject it.
 */
export async function askVisionModel(c: VisionConfig, systemPrompt: string, imageDataUrl: string): Promise<string> {
  const base = {
    model: c.visionModel,
    temperature: 0,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: [
        { type: 'text', text: 'Describe this found item as the JSON object.' },
        { type: 'image_url', image_url: { url: imageDataUrl } },
      ] },
    ],
  };
  let res = await post(c, { ...base, response_format: { type: 'json_object' } });
  if (res.status === 400 || res.status === 422) res = await post(c, base);
  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 200);
    throw new AppError(502, `The vision model returned an error (${res.status}). ${detail}`.trim(), 'vision_error');
  }
  const json = (await res.json().catch(() => null)) as { choices?: { message?: { content?: unknown } }[] } | null;
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new AppError(502, 'The vision model returned no text.', 'vision_error');
  return content;
}

/** Quick health check: GET /models answers on Ollama and LM Studio. */
export async function visionReachable(c: VisionConfig): Promise<boolean> {
  if (!visionEnabled(c)) return false;
  try {
    const res = await fetch(`${c.visionUrl}/models`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
