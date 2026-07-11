import { tmpdir } from 'node:os';
import path from 'node:path';

import JSZip from 'jszip';
import { describe, expect, it, vi } from 'vitest';
import { buildEpub } from '../src/modules/kobo/infra/epub.builder';
import { toKepubXhtml } from '../src/modules/kobo/infra/kepub.transform';
import { buildOpdsFeed } from '../src/modules/kobo/infra/opds.feed';
import { EpubCache } from '../src/modules/kobo/infra/epub.cache';
import { BuildEpubService } from '../src/modules/kobo/application/build-epub.service';

const base = {
  item: { id: 'it1', title: 'Reading Slowly', url: 'https://x.com/a', siteName: 'x.com' },
  article: { contentHtml: '<p>Hello &amp; welcome</p>' },
  images: [] as { name: string; mediaType: string; data: Uint8Array }[],
};

describe('buildEpub', () => {
  it('produces a valid epub zip with mimetype stored first', async () => {
    const bytes = await buildEpub(base);
    const zip = await JSZip.loadAsync(bytes);
    expect(await zip.file('mimetype')!.async('string')).toBe('application/epub+zip');
    expect(zip.file('META-INF/container.xml')).toBeTruthy();
    expect(zip.file('OEBPS/content.opf')).toBeTruthy();
    expect(zip.file('OEBPS/nav.xhtml')).toBeTruthy();
    const ch = await zip.file('OEBPS/chapter.xhtml')!.async('string');
    expect(ch).toContain('Hello'); // body carried over
    const opf = await zip.file('OEBPS/content.opf')!.async('string');
    expect(opf).toContain('urn:burkmak:it1'); // identifier
    expect(opf).toContain('Reading Slowly');
  });

  it('embeds images and rewrites their src', async () => {
    const bytes = await buildEpub({
      ...base,
      article: { contentHtml: '<p><img src="/api/v1/items/it1/image/abc.png"></p>' },
      images: [{ name: 'abc.png', mediaType: 'image/png', data: new Uint8Array([1, 2, 3]) }],
    });
    const zip = await JSZip.loadAsync(bytes);
    expect(zip.file('OEBPS/images/abc.png')).toBeTruthy();
    const ch = await zip.file('OEBPS/chapter.xhtml')!.async('string');
    expect(ch).toContain('images/abc.png');
    expect(ch).not.toContain('/api/v1/items/');
  });
});

describe('toKepubXhtml', () => {
  it('wraps paragraph text in koboSpans, preserving text', () => {
    const out = toKepubXhtml('<body><p>Hello world</p></body>');
    expect(out).toContain('class="koboSpan"');
    expect(out).toMatch(/id="kobo\.\d+\.\d+"/);
    expect(out).toContain('Hello world');
  });

  it('does not double-wrap', () => {
    const once = toKepubXhtml('<body><p>Hi</p></body>');
    expect(toKepubXhtml(once)).toBe(once);
  });
});

describe('buildOpdsFeed', () => {
  it('builds an acquisition feed with one entry per item', () => {
    const xml = buildOpdsFeed({
      baseUrl: 'https://h/api/v1',
      updated: '2026-06-15T00:00:00Z',
      items: [
        {
          id: 'it1',
          title: 'A & B',
          siteName: 'x.com',
          excerpt: 'hi',
          savedAt: '2026-06-14T00:00:00Z',
        },
      ],
    });
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<feed');
    expect(xml).toContain('opds-spec.org/acquisition');
    expect(xml).toContain('https://h/api/v1/items/it1/epub');
    expect(xml).toContain('A &amp; B'); // escaped
  });

  it('valid empty feed when no items', () => {
    const xml = buildOpdsFeed({
      baseUrl: 'https://h/api/v1',
      updated: '2026-06-15T00:00:00Z',
      items: [],
    });
    expect(xml).toContain('<feed');
    expect(xml).not.toContain('<entry');
  });
});

describe('BuildEpubService', () => {
  function makeService(override: { item?: unknown; article?: unknown } = {}) {
    const itemOverride = override;
    const dataDir = tmpdir();
    const mockConfig = {
      dataDir,
    } as unknown as import('../src/common/config/app-config').AppConfig;
    const epubCache = new EpubCache(mockConfig);

    const defaultItem = {
      id: 'it1',
      url: 'https://x.com/a',
      canonicalUrl: null,
      title: 'Test',
      siteName: 'x.com',
      excerpt: null,
      leadImageUrl: null,
      faviconUrl: null,
      status: 'ready' as const,
      extractStatus: 'ready' as const,
      readState: 'unread' as const,
      favorite: false,
      savedAt: '2026-06-15T00:00:00Z',
      readAt: null,
      tags: [],
    };

    const defaultArticle = {
      itemId: 'it1',
      contentHtml: '<p>Hello</p>',
      contentText: 'Hello',
      wordCount: 1,
      readingTimeMin: 1,
      extractedAt: '2026-06-15T00:00:00Z',
    };

    const mockItemRepo = {
      findById: vi
        .fn()
        .mockResolvedValue(itemOverride['item'] !== undefined ? itemOverride['item'] : defaultItem),
    };
    const mockArticleRepo = {
      findByItem: vi
        .fn()
        .mockResolvedValue(
          itemOverride['article'] !== undefined ? itemOverride['article'] : defaultArticle,
        ),
    };

    const service = new BuildEpubService(
      mockConfig,
      epubCache,
      mockItemRepo as unknown as import('../src/modules/items/domain/items.ports').IItemRepo,
      mockArticleRepo as unknown as import('../src/modules/items/domain/article.ports').IArticleRepo,
    );

    return service;
  }

  it('returns not_found when item does not exist', async () => {
    const service = makeService({ item: null });
    const result = await service.getEpub('user1', 'it1', 'epub');
    expect(result).toEqual({ error: 'not_found' });
  });

  it('returns not_ready when extractStatus is not ready', async () => {
    const service = makeService({
      item: {
        id: 'it1',
        url: 'https://x.com/a',
        canonicalUrl: null,
        title: 'Test',
        siteName: 'x.com',
        excerpt: null,
        leadImageUrl: null,
        faviconUrl: null,
        status: 'pending',
        extractStatus: 'extracting',
        readState: 'unread',
        favorite: false,
        savedAt: '2026-06-15T00:00:00Z',
        readAt: null,
        tags: [],
      },
    });
    const result = await service.getEpub('user1', 'it1', 'epub');
    expect(result).toEqual({ error: 'not_ready' });
  });

  it('returns a path for a ready item with article', async () => {
    const service = makeService({});
    const result = await service.getEpub('user1', 'it1', 'epub');
    expect(result).toHaveProperty('path');
    if ('path' in result) {
      expect(result.path).toContain('epub');
      expect(result.path.endsWith('.epub')).toBe(true);
    }
  });
});
