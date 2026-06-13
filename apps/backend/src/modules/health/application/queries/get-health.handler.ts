import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AppConfig } from '../../../../common/config/app-config';
import {
  CENTRIFUGO_CHECKER,
  DB_CHECKER,
  DependencyChecker,
  HealthSnapshot,
  REDIS_CHECKER,
  rollUp,
} from '../../domain/health';

import { GetHealthQuery } from './get-health.query';

@QueryHandler(GetHealthQuery)
export class GetHealthHandler implements IQueryHandler<GetHealthQuery, HealthSnapshot> {
  private readonly startedAt = Date.now();

  constructor(
    @Inject(DB_CHECKER) private readonly db: DependencyChecker,
    @Inject(REDIS_CHECKER) private readonly redis: DependencyChecker,
    @Inject(CENTRIFUGO_CHECKER) private readonly centrifugo: DependencyChecker,
    private readonly config: AppConfig,
  ) {}

  async execute(_query: GetHealthQuery): Promise<HealthSnapshot> {
    const [db, redis, centrifugo] = await Promise.all([
      this.db.check(),
      this.redis.check(),
      this.centrifugo.check(),
    ]);

    return {
      status: rollUp([db, redis, centrifugo]),
      version: this.config.runtime.version,
      uptimeSeconds: Math.round((Date.now() - this.startedAt) / 1000),
      dependencies: { db, redis, centrifugo },
    };
  }
}
