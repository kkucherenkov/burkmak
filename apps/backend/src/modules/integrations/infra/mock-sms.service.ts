import { Injectable, Logger } from '@nestjs/common';

import type { ISmsService, SentSms } from '../domain/sms.port';

const RING_BUFFER_SIZE = 200;

@Injectable()
export class MockSmsService implements ISmsService {
  private readonly logger = new Logger(MockSmsService.name);

  /** Ring buffer of all sent messages, oldest overwritten first. */
  private readonly buffer: SentSms[] = [];

  /** Last OTP sent per phone number. */
  private readonly otpByPhone = new Map<string, string>();

  sendOtp(to: string, code: string): Promise<void> {
    const entry: SentSms = {
      to,
      body: `Your app code: ${code}`,
      sentAt: new Date(),
    };

    if (this.buffer.length >= RING_BUFFER_SIZE) {
      this.buffer.shift();
    }
    this.buffer.push(entry);
    this.otpByPhone.set(to, code);

    this.logger.warn(`[MOCK SMS] to=${to} code=${code}`);
    return Promise.resolve();
  }

  lastOtpFor(phone: string): string | null {
    return this.otpByPhone.get(phone) ?? null;
  }

  /** Expose entire ring buffer for the dev inspector endpoint. */
  all(): readonly SentSms[] {
    return [...this.buffer];
  }
}
