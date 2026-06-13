import { Injectable, Logger } from '@nestjs/common';

import type { IPushService, PushPayload, SentPush } from '../domain/push.port';

const MAX_PER_USER = 100;

@Injectable()
export class MockPushService implements IPushService {
  private readonly logger = new Logger(MockPushService.name);
  private readonly queueMap = new Map<string, SentPush[]>();

  sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const entry: SentPush = { ...payload, userId, sentAt: new Date() };

    if (!this.queueMap.has(userId)) {
      this.queueMap.set(userId, []);
    }
    // Map.get is guaranteed non-null: we set the key above when absent.
    const queue = this.queueMap.get(userId) ?? [];
    this.queueMap.set(userId, queue);
    if (queue.length >= MAX_PER_USER) {
      queue.shift();
    }
    queue.push(entry);

    this.logger.warn(`[MOCK PUSH] userId=${userId} title="${payload.title}"`);
    return Promise.resolve();
  }

  queueFor(userId: string): readonly SentPush[] {
    return [...(this.queueMap.get(userId) ?? [])];
  }
}
