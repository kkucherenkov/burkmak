import { createHash, randomBytes } from 'node:crypto';

export const PAT_PREFIX = 'burk_pat_';

export function hashToken(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function generateToken(): { secret: string; hash: string; prefix: string } {
  const secret = PAT_PREFIX + randomBytes(32).toString('base64url');
  return { secret, hash: hashToken(secret), prefix: secret.slice(0, PAT_PREFIX.length + 4) };
}
