import { Injectable, Logger } from '@nestjs/common';

import { RedisService } from '../../../common/redis/redis.service';

import type { DependencyChecker, DependencyStatus } from '../domain/health';

@Injectable()
export class RedisChecker implements DependencyChecker {
  private readonly logger = new Logger(RedisChecker.name);

  constructor(private readonly redis: RedisService) {}

  async check(): Promise<DependencyStatus> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG' ? 'ok' : 'degraded';
    } catch (error) {
      this.logger.warn(`Redis healthcheck failed: ${String(error)}`);
      return 'down';
    }
  }
}
