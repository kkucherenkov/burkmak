import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as safeFetchModule from '../../../common/net/safe-fetch';
import { ExtractArticleHandler } from './extract-article.handler';

const job = {
  id: 'job_2',
  type: 'extract_article',
  userId: 'u1',
  itemId: 'itm_1',
} as never;

const ITEM = { id: 'itm_1', url: 'https://example.com/article' };
const RAW_HTML = '<html><body><p>Hello world</p></body></html>';
const PARSED = {
  title: 'Hello',
  contentHtml: '<p>Hello world</p>',
  contentText: 'Hello world',
  wordCount: 2,
  readingTimeMin: 1,
};
const REWRITTEN_HTML = '<p>Hello world <img src="/api/v1/items/itm_1/image/abc123.jpg"></p>';

describe('ExtractArticleHandler', () => {
  let safeFetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock safeFetch to return a Response-like with .text()
    safeFetchSpy = vi.spyOn(safeFetchModule, 'safeFetch').mockResolvedValue({
      text: vi.fn().mockResolvedValue(RAW_HTML),
      ok: true,
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('extracts article, caches images, upserts, marks ready, emits item.updated', async () => {
    const itemRepo = {
      findById: vi.fn().mockResolvedValue(ITEM),
      setExtractStatus: vi.fn().mockResolvedValue(undefined),
    };
    const extractor = { extract: vi.fn().mockReturnValue(PARSED) };
    const imageCache = { cache: vi.fn().mockResolvedValue(REWRITTEN_HTML) };
    const articleRepo = { upsert: vi.fn().mockResolvedValue(undefined) };
    const events = { publish: vi.fn() };

    const h = new ExtractArticleHandler(
      itemRepo as never,
      extractor as never,
      imageCache as never,
      articleRepo as never,
      events as never,
    );

    await h.handle(job);

    // Loaded item by owner
    expect(itemRepo.findById).toHaveBeenCalledWith('u1', 'itm_1');
    // Fetched raw HTML via safeFetch (SSRF-guarded)
    expect(safeFetchSpy).toHaveBeenCalledWith(
      ITEM.url,
      expect.objectContaining({
        headers: expect.objectContaining({ 'user-agent': expect.any(String) }),
      }),
    );
    // Extracted article
    expect(extractor.extract).toHaveBeenCalledWith(RAW_HTML, ITEM.url);
    // Cached images with rewritten html
    expect(imageCache.cache).toHaveBeenCalledWith('itm_1', PARSED.contentHtml, ITEM.url);
    // Upserted article with rewritten HTML
    expect(articleRepo.upsert).toHaveBeenCalledWith('itm_1', {
      contentHtml: REWRITTEN_HTML,
      contentText: PARSED.contentText,
      wordCount: PARSED.wordCount,
      readingTimeMin: PARSED.readingTimeMin,
    });
    // Marked item ready
    expect(itemRepo.setExtractStatus).toHaveBeenCalledWith('itm_1', 'ready');
    // Emitted item.updated
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });

  it('skips silently when item is not found (deleted before job ran)', async () => {
    const itemRepo = {
      findById: vi.fn().mockResolvedValue(null),
      setExtractStatus: vi.fn(),
    };
    const extractor = { extract: vi.fn() };
    const imageCache = { cache: vi.fn() };
    const articleRepo = { upsert: vi.fn() };
    const events = { publish: vi.fn() };

    const h = new ExtractArticleHandler(
      itemRepo as never,
      extractor as never,
      imageCache as never,
      articleRepo as never,
      events as never,
    );

    await h.handle(job);

    expect(safeFetchSpy).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });

  it('marks failed + emits item.updated then rethrows when fetch throws', async () => {
    const fetchError = new Error('connection refused');
    safeFetchSpy.mockRejectedValue(fetchError);

    const itemRepo = {
      findById: vi.fn().mockResolvedValue(ITEM),
      setExtractStatus: vi.fn().mockResolvedValue(undefined),
    };
    const extractor = { extract: vi.fn() };
    const imageCache = { cache: vi.fn() };
    const articleRepo = { upsert: vi.fn() };
    const events = { publish: vi.fn() };

    const h = new ExtractArticleHandler(
      itemRepo as never,
      extractor as never,
      imageCache as never,
      articleRepo as never,
      events as never,
    );

    await expect(h.handle(job)).rejects.toThrow('connection refused');

    expect(itemRepo.setExtractStatus).toHaveBeenCalledWith('itm_1', 'failed');
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });

  it('marks failed + emits item.updated then rethrows when extractor throws', async () => {
    const extractError = new Error('parse failed');
    const itemRepo = {
      findById: vi.fn().mockResolvedValue(ITEM),
      setExtractStatus: vi.fn().mockResolvedValue(undefined),
    };
    const extractor = {
      extract: vi.fn().mockImplementation(() => {
        throw extractError;
      }),
    };
    const imageCache = { cache: vi.fn() };
    const articleRepo = { upsert: vi.fn() };
    const events = { publish: vi.fn() };

    const h = new ExtractArticleHandler(
      itemRepo as never,
      extractor as never,
      imageCache as never,
      articleRepo as never,
      events as never,
    );

    await expect(h.handle(job)).rejects.toThrow('parse failed');

    expect(itemRepo.setExtractStatus).toHaveBeenCalledWith('itm_1', 'failed');
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });
});
