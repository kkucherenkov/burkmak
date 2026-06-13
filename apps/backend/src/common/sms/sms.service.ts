import { Injectable, Logger } from '@nestjs/common';

import { AppConfig } from '../config/app-config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: AppConfig) {}

  async sendOtp(toPhone: string, otp: string): Promise<void> {
    const { accountSid, authToken, fromNumber, configured } = this.config.sms;

    if (!configured) {
      this.logger.warn(`[DEV] SMS OTP for ${toPhone}: ${otp}`);
      return;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({
      From: fromNumber,
      To: toPhone,
      Body: `Your app code: ${otp}`,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Twilio error ${String(res.status)}: ${text}`);
      throw new Error(`SMS delivery failed: ${String(res.status)}`);
    }
  }
}
