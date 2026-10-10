import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));

export interface Config {
  port: number;
  dbPath: string;
  photoDir: string;
  /** Base URL of the web app, used when building links in notifications. */
  publicUrl: string;
  /** Minimum match score (0-100, default 70) that triggers a notification. */
  matchThreshold: number;
  /**
   * OpenAI-compatible endpoint of a LOCAL vision model used to pre-fill intake from a photo
   * (Ollama: http://localhost:11434/v1, LM Studio: http://localhost:1234/v1). "off" disables it.
   */
  visionUrl: string;
  visionModel: string;
  visionTimeoutMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 3001),
    dbPath: env.DB_PATH ?? path.join(REPO_ROOT, 'data', 'vlf.db'),
    photoDir: env.PHOTO_DIR ?? path.join(REPO_ROOT, 'data', 'photos'),
    publicUrl: env.PUBLIC_URL ?? 'http://localhost:5173',
    matchThreshold: Number(env.MATCH_THRESHOLD ?? 70),
    visionUrl: (env.VISION_URL ?? 'http://localhost:11434/v1').replace(/\/+$/, ''),
    visionModel: env.VISION_MODEL ?? 'qwen2.5vl:7b',
    visionTimeoutMs: Number(env.VISION_TIMEOUT_MS ?? 60000),
  };
}
