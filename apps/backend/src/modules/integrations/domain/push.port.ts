export const PUSH_PORT = Symbol('PushPort');

export interface PushPayload {
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, string>;
}

export interface SentPush extends PushPayload {
  readonly userId: string;
  readonly sentAt: Date;
}

export interface IPushService {
  /** Send a push notification to a user by their internal user ID. */
  sendToUser(userId: string, payload: PushPayload): Promise<void>;

  /**
   * Returns all push notifications queued for a user.
   * Only meaningful on mock implementations — real providers return [].
   */
  queueFor(userId: string): readonly SentPush[];
}
