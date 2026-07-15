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
    const sorted = sortShelves([shelf('1', 'zeta'), shelf('2', 'Alpha')]);
    expect(sorted.map((s) => s.name)).toEqual(['Alpha', 'zeta']);
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
