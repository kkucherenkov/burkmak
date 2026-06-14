import { describe, expect, it } from 'vitest';

import { toCardData } from '../../app/utils/to-card-data';

it('maps an Item to AppItemCardData (drops server-only timestamps)', () => {
  const card = toCardData({
    id: 'a',
    url: 'https://x',
    canonicalUrl: null,
    title: 'T',
    siteName: 'S',
    excerpt: 'E',
    leadImageUrl: null,
    faviconUrl: null,
    status: 'ready',
    readState: 'read',
    favorite: true,
    savedAt: '2026-06-13T00:00:00Z',
    readAt: null,
    tags: ['x'],
  } as never);
  expect(card).toMatchObject({ id: 'a', title: 'T', status: 'ready', favorite: true, tags: ['x'] });
  expect('savedAt' in card).toBe(false);
});
