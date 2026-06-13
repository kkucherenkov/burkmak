import { beforeEach, describe, expect, it } from 'vitest';

import { MockEmailService } from './mock-email.service';

describe('MockEmailService', () => {
  let svc: MockEmailService;

  beforeEach(() => {
    svc = new MockEmailService();
  });

  it('stores sent email in ring buffer', async () => {
    await svc.send({ to: 'user@example.com', subject: 'Test', text: 'Hello' });
    const all = svc.all();
    expect(all).toHaveLength(1);
    expect(all[0]?.to).toBe('user@example.com');
    expect(all[0]?.subject).toBe('Test');
  });

  it('sentTo filters by address', async () => {
    await svc.send({ to: 'a@example.com', subject: 'A', text: 'a' });
    await svc.send({ to: 'b@example.com', subject: 'B', text: 'b' });
    await svc.send({ to: 'a@example.com', subject: 'A2', text: 'a2' });

    expect(svc.sentTo('a@example.com')).toHaveLength(2);
    expect(svc.sentTo('b@example.com')).toHaveLength(1);
    expect(svc.sentTo('c@example.com')).toHaveLength(0);
  });

  it('ring buffer evicts oldest entries beyond capacity', async () => {
    for (let i = 0; i < 201; i++) {
      await svc.send({
        to: `u${String(i)}@example.com`,
        subject: `s${String(i)}`,
        text: `t${String(i)}`,
      });
    }
    expect(svc.all()).toHaveLength(200);
  });
});
