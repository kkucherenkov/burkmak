import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GetHealthHandler } from './application/queries/get-health.handler';
import { DB_CHECKER } from './domain/health';
import { HealthController } from './health.controller';
import { PrismaDbChecker } from './infra/prisma-db.checker';

@Module({
  imports: [CqrsModule],
  controllers: [HealthController],
  providers: [GetHealthHandler, { provide: DB_CHECKER, useClass: PrismaDbChecker }],
})
export class HealthModule {}
