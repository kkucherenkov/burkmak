import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import type { DependencyChecker, DependencyStatus } from '../domain/health';

@Injectable()
export class PrismaDbChecker implements DependencyChecker {
  private readonly logger = new Logger(PrismaDbChecker.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<DependencyStatus> {
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      return 'ok';
    } catch (error) {
      this.logger.warn(`DB healthcheck failed: ${String(error)}`);
      return 'down';
    }
  }
}
