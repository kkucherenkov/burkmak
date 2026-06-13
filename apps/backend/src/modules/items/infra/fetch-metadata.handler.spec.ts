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
      findById: vi.fn().mockResolvedValue({ id: 'itm_1', url: 'https://x.com' }),
      applyMetadata: vi.fn(),
    };
    const events = { publish: vi.fn() };
    const h = new FetchMetadataHandler(repo as never, fetcher as never, events as never);
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
    };
    const events = { publish: vi.fn() };
    const h = new FetchMetadataHandler(repo as never, fetcher as never, events as never);
    await expect(h.handle(job)).rejects.toThrow('timeout');
    expect(repo.applyMetadata).toHaveBeenCalledWith('itm_1', { status: 'failed' });
  });
});
