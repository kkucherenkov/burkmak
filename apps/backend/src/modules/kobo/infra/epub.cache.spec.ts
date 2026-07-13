import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { EpubCache } from './epub.cache';

import type { AppConfig } from '../../../common/config/app-config';

const config = { dataDir: '/data' } as AppConfig;

describe('EpubCache.cachePath', () => {
  it('builds ${dataDir}/epub/<itemId>/<variant>-<extractedAtSafe>.epub', () => {
    const cache = new EpubCache(config);
    expect(cache.cachePath('ckv9v0y0c0000qzrmn831i7rn', 'kepub', '2026-07-14T10:00:00.000Z')).toBe(
      path.resolve('/data/epub/ckv9v0y0c0000qzrmn831i7rn/kepub-2026-07-14T10-00-00-000Z.epub'),
    );
  });

  it('throws when the itemId would escape the epub root', () => {
    const cache = new EpubCache(config);
    expect(() => cache.cachePath('../../etc', 'epub', '2026-07-14T10:00:00.000Z')).toThrow(
      /unsafe cache path/,
    );
  });
});
