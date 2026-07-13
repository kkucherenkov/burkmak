import { describe, it, expect, vi } from 'vitest';
import { FetchMetadataHandler } from './fetch-metadata.handler';

const job = { id: 'job_1', type: 'fetch_metadata', userId: 'u1', itemId: 'itm_1' } as never;

describe('FetchMetadataHandler', () => {
  it('writes parsed metadata + ready, then emits item.updated', async () => {
    const fetcher = {
      fetch: vi.fn().mockResolvedValue({
        title: 'T',
        siteName: 'S',
        excerpt: null,
        leadImageUrl: null,
        faviconUrl: 'f',
        canonicalUrl: null,
      }),
    };
    const repo = {
      findById: vi
        .fn()
        .mockResolvedValue({ id: 'itm_1', url: 'https://x.com', extractStatus: 'ready' }),
      applyMetadata: vi.fn(),
      setExtractStatus: vi.fn(),
    };
    const events = { publish: vi.fn() };
    const jobs = { enqueue: vi.fn() };
    const h = new FetchMetadataHandler(
      repo as never,
      fetcher as never,
      events as never,
      jobs as never,
    );
    await h.handle(job);
    expect(repo.applyMetadata).toHaveBeenCalledWith(
      'itm_1',
      expect.objectContaining({ title: 'T', status: 'ready' }),
    );
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });

  it('marks the item failed (retained) when fetch throws', async () => {
    const fetcher = { fetch: vi.fn().mockRejectedValue(new Error('timeout')) };
    const repo = {
      findById: vi.fn().mockResolvedValue({ id: 'itm_1', url: 'https://x.com' }),
      applyMetadata: vi.fn(),
      setExtractStatus: vi.fn(),
    };
    const events = { publish: vi.fn() };
    const jobs = { enqueue: vi.fn() };
    const h = new FetchMetadataHandler(
      repo as never,
      fetcher as never,
      events as never,
      jobs as never,
    );
    await expect(h.handle(job)).rejects.toThrow('timeout');
    expect(repo.applyMetadata).toHaveBeenCalledWith('itm_1', { status: 'failed' });
  });

  const META = {
    title: 'T',
    siteName: null,
    excerpt: null,
    leadImageUrl: null,
    faviconUrl: null,
    canonicalUrl: null,
  };

  it('auto-enqueues extract_article when extractStatus is none', async () => {
    const fetcher = { fetch: vi.fn().mockResolvedValue(META) };
    const repo = {
      findById: vi
        .fn()
        .mockResolvedValue({ id: 'itm_1', url: 'https://x.com', extractStatus: 'none' }),
      applyMetadata: vi.fn(),
      setExtractStatus: vi.fn(),
    };
    const events = { publish: vi.fn() };
    const jobs = { enqueue: vi.fn() };
    const h = new FetchMetadataHandler(
      repo as never,
      fetcher as never,
      events as never,
      jobs as never,
    );
    await h.handle(job);
    expect(repo.setExtractStatus).toHaveBeenCalledWith('itm_1', 'extracting');
    expect(jobs.enqueue).toHaveBeenCalledWith('extract_article', { userId: 'u1', itemId: 'itm_1' });
  });

  it('does not chain extraction when extractStatus is not none', async () => {
    const fetcher = { fetch: vi.fn().mockResolvedValue(META) };
    const repo = {
      findById: vi
        .fn()
        .mockResolvedValue({ id: 'itm_1', url: 'https://x.com', extractStatus: 'ready' }),
      applyMetadata: vi.fn(),
      setExtractStatus: vi.fn(),
    };
    const events = { publish: vi.fn() };
    const jobs = { enqueue: vi.fn() };
    const h = new FetchMetadataHandler(
      repo as never,
      fetcher as never,
      events as never,
      jobs as never,
    );
    await h.handle(job);
    expect(repo.setExtractStatus).not.toHaveBeenCalled();
    expect(jobs.enqueue).not.toHaveBeenCalled();
  });

  it('does not chain extraction when metadata fetch fails', async () => {
    const fetcher = { fetch: vi.fn().mockRejectedValue(new Error('timeout')) };
    const repo = {
      findById: vi
        .fn()
        .mockResolvedValue({ id: 'itm_1', url: 'https://x.com', extractStatus: 'none' }),
      applyMetadata: vi.fn(),
      setExtractStatus: vi.fn(),
    };
    const events = { publish: vi.fn() };
    const jobs = { enqueue: vi.fn() };
    const h = new FetchMetadataHandler(
      repo as never,
      fetcher as never,
      events as never,
      jobs as never,
    );
    await expect(h.handle(job)).rejects.toThrow('timeout');
    expect(jobs.enqueue).not.toHaveBeenCalled();
  });

  it('keeps metadata ready and reverts extractStatus when chain enqueue fails', async () => {
    const fetcher = { fetch: vi.fn().mockResolvedValue(META) };
    const repo = {
      findById: vi
        .fn()
        .mockResolvedValue({ id: 'itm_1', url: 'https://x.com', extractStatus: 'none' }),
      applyMetadata: vi.fn(),
      setExtractStatus: vi.fn().mockResolvedValue(undefined),
    };
    const events = { publish: vi.fn() };
    const jobs = { enqueue: vi.fn().mockRejectedValue(new Error('db busy')) };
    const h = new FetchMetadataHandler(
      repo as never,
      fetcher as never,
      events as never,
      jobs as never,
    );
    await h.handle(job); // resolves — chain failure is swallowed
    expect(repo.applyMetadata).toHaveBeenCalledWith(
      'itm_1',
      expect.objectContaining({ status: 'ready' }),
    );
    expect(repo.applyMetadata).not.toHaveBeenCalledWith('itm_1', { status: 'failed' });
    expect(repo.setExtractStatus).toHaveBeenNthCalledWith(1, 'itm_1', 'extracting');
    expect(repo.setExtractStatus).toHaveBeenNthCalledWith(2, 'itm_1', 'none');
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });
});
