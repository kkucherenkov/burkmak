export const EMAIL_PORT = Symbol('EmailPort');

export interface EmailPayload {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
}

export interface SentEmail extends EmailPayload {
  readonly sentAt: Date;
}

export interface IEmailService {
  /** Send an email. */
  send(payload: EmailPayload): Promise<void>;

  /**
   * Returns all emails sent to a specific address.
   * Only meaningful on mock implementations — real providers return [].
   */
  sentTo(address: string): readonly SentEmail[];
}
