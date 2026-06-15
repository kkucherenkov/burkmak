import { describe, expect, it } from 'vitest';
import { generateToken, hashToken, PAT_PREFIX } from '../src/modules/tokens/infra/pat.crypto';

describe('pat.crypto', () => {
  it('generates a prefixed url-safe secret + a stable sha256 hash + display prefix', () => {
    const { secret, hash, prefix } = generateToken();
    expect(secret.startsWith(PAT_PREFIX)).toBe(true);
    expect(secret).toMatch(/^burk_pat_[A-Za-z0-9_-]{20,}$/);
    expect(hash).toBe(hashToken(secret));
    expect(hash).toHaveLength(64); // sha256 hex
    expect(secret.startsWith(prefix)).toBe(true);
    expect(prefix.length).toBeLessThan(secret.length);
  });
  it('hashes deterministically and differs per secret', () => {
    expect(hashToken('burk_pat_a')).toBe(hashToken('burk_pat_a'));
    expect(hashToken('burk_pat_a')).not.toBe(hashToken('burk_pat_b'));
  });
});
