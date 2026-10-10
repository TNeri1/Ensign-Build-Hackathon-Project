import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));

export interface Config {
  port: number;
  dbPath: string;
  photoDir: string;
  /** Base URL of the web app, used when building links in notifications. */
  publicUrl: string;
  /** Minimum match score (0-100) that triggers a notification. */
  matchThreshold: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 3001),
    dbPath: env.DB_PATH ?? path.join(REPO_ROOT, 'data', 'vlf.db'),
    photoDir: env.PHOTO_DIR ?? path.join(REPO_ROOT, 'data', 'photos'),
    publicUrl: env.PUBLIC_URL ?? 'http://localhost:5173',
    matchThreshold: Number(env.MATCH_THRESHOLD ?? 60),
  };
}
