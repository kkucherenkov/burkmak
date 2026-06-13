export const SMS_PORT = Symbol('SmsPort');

export interface SentSms {
  readonly to: string;
  readonly body: string;
  readonly sentAt: Date;
}

export interface ISmsService {
  /** Send an OTP code to the given phone number. */
  sendOtp(to: string, code: string): Promise<void>;

  /**
   * Returns the last OTP sent to a phone number, or null if none exists.
   * Only meaningful on mock implementations — real providers return null.
   */
  lastOtpFor(phone: string): string | null;
}
