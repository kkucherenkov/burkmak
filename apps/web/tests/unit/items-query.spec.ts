import { describe, expect, it } from 'vitest';

import { buildItemsQuery, type Filters } from '~/composables/useItems';

const base: Filters = { segment: 'unread', q: '', tag: null };

describe('buildItemsQuery', () => {
  it('defaults an article query to the read-state segment', () => {
    expect(buildItemsQuery(base, 'article')).toEqual({
      kind: 'article',
      q: undefined,
      tag: undefined,
      limit: 20,
      readState: 'unread',
    });
  });

  it('maps the favorite segment to a favorite flag, not a readState', () => {
    const q = buildItemsQuery({ ...base, segment: 'favorite' }, 'article');
    expect(q.favorite).toBe(true);
    expect(q.readState).toBeUndefined();
  });

  it('passes the search term through', () => {
    expect(buildItemsQuery({ ...base, q: 'rust' }, 'article').q).toBe('rust');
  });

  it('a bookmark query carries kind but no read-state segmentation', () => {
    const q = buildItemsQuery({ ...base, segment: 'read' }, 'bookmark');
    expect(q).toEqual({ kind: 'bookmark', q: undefined, tag: undefined, limit: 20 });
    expect(q.readState).toBeUndefined();
    expect(q.favorite).toBeUndefined();
  });
});
