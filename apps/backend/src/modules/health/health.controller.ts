import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';

import { GetHealthQuery } from './application/queries/get-health.query';

import type { HealthSnapshot } from './domain/health';
import type { Response } from 'express';

@Controller({ path: 'health', version: '1' })
@SkipThrottle()
export class HealthController {
  constructor(private readonly queries: QueryBus) {}

  @Get()
  async get(@Res({ passthrough: true }) res: Response): Promise<HealthSnapshot> {
    const snapshot = await this.queries.execute<GetHealthQuery, HealthSnapshot>(
      new GetHealthQuery(),
    );
    res.status(snapshot.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return snapshot;
  }
}
