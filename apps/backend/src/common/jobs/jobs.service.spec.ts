import { describe, it, expect, vi } from 'vitest';
import { JobsService } from './jobs.service';

function prismaMock() {
  return { job: { create: vi.fn().mockImplementation(({ data }) => ({ id: 'j1', ...data })) } };
}

describe('JobsService', () => {
  it('enqueues a queued job with serialized payload', async () => {
    const prisma = prismaMock();
    const svc = new JobsService(prisma as never);
    const job = await svc.enqueue('fetch_metadata', {
      itemId: 'i1',
      userId: 'u1',
      payload: { url: 'x' },
    });
    expect(prisma.job.create).toHaveBeenCalledWith({
      data: {
        type: 'fetch_metadata',
        userId: 'u1',
        itemId: 'i1',
        payload: JSON.stringify({ url: 'x' }),
        status: 'queued',
      },
    });
    expect(job.id).toBe('j1');
  });
});
