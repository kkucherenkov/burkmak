import { describe, it, expect } from 'vitest';

import { sortShelves, upsertShelf, removeShelfById } from '~/composables/useShelves';

const shelf = (id: string, name: string, itemCount = 0) => ({
  id,
  name,
  itemCount,
  createdAt: '2026-07-15T00:00:00.000Z',
  lastModified: '2026-07-15T00:00:00.000Z',
});

describe('shelves store helpers', () => {
  it('sorts by name, case-insensitively', () => {
    // 'Zeta' vs 'alpha': plain ASCII sort would put 'Zeta' first ('Z' = 90 <
    // 'a' = 97), so this only passes if localeCompare's case folding is
    // actually in effect. The original fixture (zeta/Alpha) happened to give
    // the same answer under both a case-folding sort AND plain ASCII order,
    // so it passed whether or not localeCompare was doing anything.
    const sorted = sortShelves([shelf('1', 'Zeta'), shelf('2', 'alpha')]);
    expect(sorted.map((s) => s.name)).toEqual(['alpha', 'Zeta']);
  });

  it('upsert replaces in place and keeps the sort', () => {
    const next = upsertShelf([shelf('1', 'Alpha'), shelf('2', 'Zeta')], shelf('2', 'Beta'));
    expect(next.map((s) => s.name)).toEqual(['Alpha', 'Beta']);
    expect(next).toHaveLength(2);
  });

  it('upsert appends an unseen shelf', () => {
    const next = upsertShelf([shelf('1', 'Alpha')], shelf('2', 'Beta'));
    expect(next.map((s) => s.id)).toEqual(['1', '2']);
  });

  it('removeShelfById drops only the target', () => {
    const next = removeShelfById([shelf('1', 'Alpha'), shelf('2', 'Beta')], '1');
    expect(next.map((s) => s.id)).toEqual(['2']);
  });
});
