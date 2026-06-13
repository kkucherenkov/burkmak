import { beforeEach, describe, expect, it } from 'vitest';

import { MockSmsService } from './mock-sms.service';

describe('MockSmsService', () => {
  let svc: MockSmsService;

  beforeEach(() => {
    svc = new MockSmsService();
  });

  it('stores sent OTP in ring buffer', async () => {
    await svc.sendOtp('+35799000001', '123456');
    const all = svc.all();
    expect(all).toHaveLength(1);
    expect(all[0]?.to).toBe('+35799000001');
    expect(all[0]?.body).toContain('123456');
  });

  it('lastOtpFor returns the most recent code for a number', async () => {
    await svc.sendOtp('+35799000001', '111111');
    await svc.sendOtp('+35799000001', '222222');
    expect(svc.lastOtpFor('+35799000001')).toBe('222222');
  });

  it('lastOtpFor returns null for unknown number', () => {
    expect(svc.lastOtpFor('+00000000000')).toBeNull();
  });

  it('ring buffer evicts oldest entries beyond capacity', async () => {
    // Fill beyond RING_BUFFER_SIZE (200)
    for (let i = 0; i < 201; i++) {
      await svc.sendOtp(`+357990000${String(i).padStart(2, '0')}`, `${String(i).padStart(6, '0')}`);
    }
    expect(svc.all()).toHaveLength(200);
  });
});
