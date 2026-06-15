import { describe, expect, it } from 'vitest';

import type { components } from '@app/specs';
import { formatLastUsed, tokenRows } from '../../app/utils/token-view';

type PersonalAccessToken = components['schemas']['PersonalAccessToken'];

const token = (over: Partial<PersonalAccessToken> = {}): PersonalAccessToken => ({
  id: 'tok_1',
  name: 'Kobo e-reader',
  prefix: 'burk_pat_ab12',
  lastUsedAt: null,
  createdAt: '2026-06-15T10:00:00Z',
  ...over,
});

describe('formatLastUsed', () => {
  it('returns neverLabel when lastUsedAt is null', () => {
    expect(formatLastUsed(null, 'Never')).toBe('Never');
  });

  it('returns neverLabel when lastUsedAt is undefined', () => {
    expect(formatLastUsed(undefined, 'Never')).toBe('Never');
  });

  it('returns a non-empty string for a valid ISO timestamp', () => {
    const result = formatLastUsed('2026-06-15T10:00:00Z', 'Never');
    expect(result).not.toBe('Never');
    expect(result.length).toBeGreaterThan(0);
  });

  it('does not return the raw ISO string verbatim', () => {
    const iso = '2026-06-15T10:00:00Z';
    const result = formatLastUsed(iso, 'Never');
    expect(result).not.toBe(iso);
  });
});

describe('tokenRows', () => {
  it('maps an empty array to empty rows', () => {
    expect(tokenRows([], 'Never')).toEqual([]);
  });

  it('maps tokens to rows with id, name, prefix, lastUsed, createdAt', () => {
    const rows = tokenRows([token()], 'Never');
    expect(rows).toHaveLength(1);
    const row = rows[0]!;
    expect(row.id).toBe('tok_1');
    expect(row.name).toBe('Kobo e-reader');
    expect(row.prefix).toBe('burk_pat_ab12');
    expect(row.lastUsed).toBe('Never');
    expect(typeof row.createdAt).toBe('string');
    expect(row.createdAt.length).toBeGreaterThan(0);
  });

  it('formats lastUsed when lastUsedAt is set', () => {
    const rows = tokenRows([token({ lastUsedAt: '2026-06-10T08:00:00Z' })], 'Never');
    expect(rows[0]!.lastUsed).not.toBe('Never');
  });
});
