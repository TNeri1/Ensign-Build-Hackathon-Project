import crypto from 'node:crypto';

export const newId = (): string => crypto.randomUUID();
export const nowIso = (): string => new Date().toISOString();

/** Unguessable URL-safe token (32 random bytes). */
export const newToken = (): string => crypto.randomBytes(32).toString('base64url');
/** Tokens are stored hashed; a DB leak must not reveal usable links. */
export const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');
