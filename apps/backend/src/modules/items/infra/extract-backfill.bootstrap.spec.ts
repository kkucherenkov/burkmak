import { describe, it, expect, vi } from 'vitest';
import { ExtractBackfillService } from './extract-backfill.bootstrap';

function makePrisma(overrides: {
  marker?: { id: string } | null;
  candidates?: { id: string; userId: string }[];
}) {
  return {
    job: {
      findFirst: vi.fn().mockResolvedValue(overrides.marker ?? null),
      create: vi.fn().mockResolvedValue({ id: 'job_marker' }),
    },
    item: {
      findMany: vi.fn().mockResolvedValue(overrides.candidates ?? []),
      update: vi.fn().mockResolvedValue({}),
    },
  };
}

describe('ExtractBackfillService', () => {
  it('no-ops when the marker job exists', async () => {
    const prisma = makePrisma({ marker: { id: 'job_0' } });
    const jobs = { enqueue: vi.fn() };
    const events = { publish: vi.fn() };
    const svc = new ExtractBackfillService(prisma as never, jobs as never, events as never);
    await svc.onApplicationBootstrap();
    expect(prisma.job.findFirst).toHaveBeenCalledWith({
      where: { type: 'extract_backfill', status: 'done' },
      select: { id: true },
    });
    expect(prisma.item.findMany).not.toHaveBeenCalled();
    expect(jobs.enqueue).not.toHaveBeenCalled();
    expect(prisma.job.create).not.toHaveBeenCalled();
  });

  it('enqueues candidates, marks them extracting, publishes, then writes the marker', async () => {
    const prisma = makePrisma({
      candidates: [
        { id: 'itm_1', userId: 'u1' },
        { id: 'itm_2', userId: 'u2' },
      ],
    });
    const jobs = { enqueue: vi.fn() };
    const events = { publish: vi.fn() };
    const svc = new ExtractBackfillService(prisma as never, jobs as never, events as never);
    await svc.onApplicationBootstrap();
    expect(prisma.item.findMany).toHaveBeenCalledWith({
      where: { status: 'ready', extractStatus: { in: ['none', 'failed'] } },
      select: { id: true, userId: true },
    });
    expect(prisma.item.update).toHaveBeenCalledWith({
      where: { id: 'itm_1' },
      data: { extractStatus: 'extracting' },
    });
    expect(jobs.enqueue).toHaveBeenCalledWith('extract_article', { userId: 'u1', itemId: 'itm_1' });
    expect(jobs.enqueue).toHaveBeenCalledWith('extract_article', { userId: 'u2', itemId: 'itm_2' });
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
    expect(prisma.job.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: 'extract_backfill', status: 'done' }),
    });
  });

  it('logs and swallows errors instead of failing app bootstrap', async () => {
    const prisma = makePrisma({});
    prisma.job.findFirst.mockRejectedValue(new Error('db locked'));
    const jobs = { enqueue: vi.fn() };
    const events = { publish: vi.fn() };
    const svc = new ExtractBackfillService(prisma as never, jobs as never, events as never);
    await expect(svc.onApplicationBootstrap()).resolves.toBeUndefined();
    expect(jobs.enqueue).not.toHaveBeenCalled();
  });
});
