import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { assertSafeItemId, isSafeItemId } from './safe-id';

describe('isSafeItemId', () => {
  it('accepts a cuid', () => {
    expect(isSafeItemId('ckv9v0y0c0000qzrmn831i7rn')).toBe(true);
  });

  it('rejects path traversal', () => {
    expect(isSafeItemId('..')).toBe(false);
    expect(isSafeItemId('../../etc')).toBe(false);
    expect(isSafeItemId('a/b')).toBe(false);
    expect(isSafeItemId(String.raw`a\b`)).toBe(false);
  });

  it('rejects empty, dotted, uppercase, and oversized ids', () => {
    expect(isSafeItemId('')).toBe(false);
    expect(isSafeItemId('a.b')).toBe(false);
    expect(isSafeItemId('ABC123')).toBe(false);
    expect(isSafeItemId('a'.repeat(65))).toBe(false);
  });
});

describe('assertSafeItemId', () => {
  it('passes a cuid through', () => {
    expect(() => {
      assertSafeItemId('ckv9v0y0c0000qzrmn831i7rn');
    }).not.toThrow();
  });

  it('throws NotFoundException on a malformed id', () => {
    expect(() => {
      assertSafeItemId('../escape');
    }).toThrow(NotFoundException);
  });
});
