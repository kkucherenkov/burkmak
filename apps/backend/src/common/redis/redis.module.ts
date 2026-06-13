import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

import { AppConfig } from '../config/app-config';

import { REDIS_CLIENT, RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [AppConfig],
      useFactory: (config: AppConfig): Redis =>
        new Redis(config.redisUrl, { lazyConnect: false, maxRetriesPerRequest: 3 }),
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
