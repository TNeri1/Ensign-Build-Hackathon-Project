import fs from 'node:fs';
import path from 'node:path';
import { badRequest } from '../errors';

const EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
};
const MIME = Object.fromEntries(Object.entries(EXT).map(([m, e]) => [e, m]));

/** Save a photo as `<itemId><ext>` in photoDir; returns the stored file name. */
export function savePhoto(photoDir: string, itemId: string, buf: Buffer, mimetype: string): string {
  const ext = EXT[mimetype];
  if (!ext) throw badRequest('Photo must be JPEG, PNG, WebP or HEIC');
  fs.mkdirSync(photoDir, { recursive: true });
  const name = `${itemId}${ext}`;
  fs.writeFileSync(path.join(photoDir, name), buf);
  return name;
}

export function readPhoto(photoDir: string, name: string): { data: Buffer; mimetype: string } | null {
  const safe = path.basename(name);
  const file = path.join(photoDir, safe);
  if (!fs.existsSync(file)) return null;
  return { data: fs.readFileSync(file), mimetype: MIME[path.extname(safe)] ?? 'application/octet-stream' };
}
