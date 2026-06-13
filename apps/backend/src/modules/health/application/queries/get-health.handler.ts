import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AppConfig } from '../../../../common/config/app-config';
import { DB_CHECKER, DependencyChecker, HealthSnapshot, rollUp } from '../../domain/health';

import { GetHealthQuery } from './get-health.query';

@QueryHandler(GetHealthQuery)
export class GetHealthHandler implements IQueryHandler<GetHealthQuery, HealthSnapshot> {
  private readonly startedAt = Date.now();

  constructor(
    @Inject(DB_CHECKER) private readonly db: DependencyChecker,
    private readonly config: AppConfig,
  ) {}

  async execute(_query: GetHealthQuery): Promise<HealthSnapshot> {
    const db = await this.db.check();

    return {
      status: rollUp([db]),
      version: this.config.runtime.version,
      uptimeSeconds: Math.round((Date.now() - this.startedAt) / 1000),
      dependencies: { db },
    };
  }
}
