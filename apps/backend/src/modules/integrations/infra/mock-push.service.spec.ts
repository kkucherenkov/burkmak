import { beforeEach, describe, expect, it } from 'vitest';

import { MockPushService } from './mock-push.service';

describe('MockPushService', () => {
  let svc: MockPushService;

  beforeEach(() => {
    svc = new MockPushService();
  });

  it('queues a push notification for a user', async () => {
    await svc.sendToUser('user-1', { title: 'Hello', body: 'World' });
    const queue = svc.queueFor('user-1');
    expect(queue).toHaveLength(1);
    expect(queue[0]?.title).toBe('Hello');
    expect(queue[0]?.userId).toBe('user-1');
  });

  it('queues are isolated per user', async () => {
    await svc.sendToUser('user-1', { title: 'A', body: 'a' });
    await svc.sendToUser('user-2', { title: 'B', body: 'b' });
    expect(svc.queueFor('user-1')).toHaveLength(1);
    expect(svc.queueFor('user-2')).toHaveLength(1);
  });

  it('returns empty array for unknown user', () => {
    expect(svc.queueFor('nobody')).toHaveLength(0);
  });

  it('per-user queue evicts oldest entries beyond capacity', async () => {
    for (let i = 0; i < 101; i++) {
      await svc.sendToUser('user-1', { title: `t${String(i)}`, body: `b${String(i)}` });
    }
    expect(svc.queueFor('user-1')).toHaveLength(100);
  });
});
