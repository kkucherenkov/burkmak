import type { AppItemCardData } from '@app/ui';

import type { components } from '@app/specs';

type Item = components['schemas']['Item'];

export function toCardData(item: Item): AppItemCardData {
  return {
    id: item.id,
    url: item.url,
    title: item.title ?? null,
    siteName: item.siteName ?? null,
    excerpt: item.excerpt ?? null,
    faviconUrl: item.faviconUrl ?? null,
    leadImageUrl: item.leadImageUrl ?? null,
    status: item.status,
    readState: item.readState,
    favorite: item.favorite,
    tags: [...item.tags],
  };
}
