import { describe, it, expect, vi } from 'vitest';
import { JobWorker } from './job-worker';

function makeDeps(job: Record<string, unknown> | null) {
  const updates: Record<string, unknown>[] = [];
  const prisma = {
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
    job: {
      findFirst: vi.fn().mockResolvedValue(job),
      update: vi.fn().mockImplementation(({ data }) => {
        updates.push(data);
        return { ...job, ...data };
      }),
    },
  };
  const config = { jobs: { pollIntervalMs: 1000, backoffBaseMs: 1000 } };
  return { prisma, config, updates };
}

describe('JobWorker.runOnce', () => {
  it('marks a job done when its handler succeeds', async () => {
    const { prisma, config, updates } = makeDeps({
      id: 'j1',
      type: 't',
      attempts: 0,
      maxAttempts: 3,
    });
    const worker = new JobWorker(prisma as never, config as never);
    const handle = vi.fn().mockResolvedValue(undefined);
    worker.register({ type: 't', handle });
    await worker.runOnce();
    expect(handle).toHaveBeenCalledOnce();
    expect(updates.at(-1)).toMatchObject({ status: 'done' });
  });

  it('requeues with backoff on failure until maxAttempts, then fails', async () => {
    const { prisma, config, updates } = makeDeps({
      id: 'j1',
      type: 't',
      attempts: 2,
      maxAttempts: 3,
    });
    const worker = new JobWorker(prisma as never, config as never);
    worker.register({ type: 't', handle: vi.fn().mockRejectedValue(new Error('boom')) });
    await worker.runOnce();
    expect(updates.at(-1)).toMatchObject({ status: 'failed' });
  });

  it('requeues with a future runAfter (backoff) when attempts remain', async () => {
    const { prisma, config, updates } = makeDeps({
      id: 'j1',
      type: 't',
      attempts: 0,
      maxAttempts: 3,
    });
    const worker = new JobWorker(prisma as never, config as never);
    worker.register({ type: 't', handle: vi.fn().mockRejectedValue(new Error('boom')) });
    const before = Date.now();
    await worker.runOnce();
    const last = updates.at(-1) as { status: string; error: string; runAfter: Date };
    expect(last).toMatchObject({ status: 'queued', error: 'boom' });
    // backoffBaseMs * 2**(1-1) = 1000ms in the future, not failed.
    expect(last.runAfter).toBeInstanceOf(Date);
    expect(last.runAfter.getTime()).toBeGreaterThanOrEqual(before + config.jobs.backoffBaseMs);
  });

  it('does nothing when no job is claimable', async () => {
    const { prisma, config } = makeDeps(null);
    const worker = new JobWorker(prisma as never, config as never);
    await worker.runOnce();
    expect(prisma.job.update).not.toHaveBeenCalled();
  });
});
