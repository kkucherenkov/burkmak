import { describe, expect, it } from 'vitest';
import { slugFilename } from '../src/modules/export/infra/slugify';

describe('slugFilename', () => {
  it('slugifies title + short id suffix, .md', () => {
    expect(slugFilename('The Case for Reading Slowly!', 'cmqd1234')).toBe(
      'the-case-for-reading-slowly-cmqd1234.md',
    );
  });
  it('falls back to id when title empty', () => {
    expect(slugFilename(null, 'cmqd1234')).toBe('cmqd1234.md');
  });
  it('collapses non-alnum and trims', () => {
    expect(slugFilename('  A  —  B ', 'id1')).toBe('a-b-id1.md');
  });
});
