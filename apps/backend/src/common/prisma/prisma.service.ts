import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

import { AppConfig } from '../config/app-config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: AppConfig) {
    super({
      adapter: new PrismaBetterSqlite3({ url: config.databaseUrl }),
      log: ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    // WAL: API + worker both write; WAL allows concurrent readers + one writer.
    await this.$executeRawUnsafe('PRAGMA journal_mode=WAL;');
    await this.$executeRawUnsafe('PRAGMA busy_timeout=5000;');
    this.logger.log('Prisma connected (sqlite, WAL)');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
