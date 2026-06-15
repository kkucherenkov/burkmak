import path from 'node:path';

import { Module, type DynamicModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';

import { AuthModule } from './common/auth/auth.module';
import { DataLoaderModule } from './common/dataloader/dataloader.module';
import { FtsModule } from './common/fts/fts.module';
import { NotificationsModule } from './common/notifications/notifications.module';
import { ConfigModule } from './common/config/config.module';
import { JobsModule } from './common/jobs/jobs.module';
import { ObservabilityModule } from './common/observability/observability.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { SmsModule } from './common/sms/sms.module';
import { EventsModule } from './modules/events/events.module';
import { ExportModule } from './modules/export/export.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { HealthModule } from './modules/health/health.module';
import { ItemsModule } from './modules/items/items.module';
import { HighlightsModule } from './modules/highlights/highlights.module';
import { TagsModule } from './modules/tags/tags.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { KoboModule } from './modules/kobo/kobo.module';

type ImportableModule = DynamicModule | (new (...args: unknown[]) => unknown);

const devOnlyModules: ImportableModule[] = [];

@Module({
  imports: [
    ConfigModule,
    CqrsModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 60 }],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.resolve(__dirname, 'i18n'),
        watch: false,
      },
      resolvers: [
        new QueryResolver(['lang']),
        new HeaderResolver(['x-lang']),
        AcceptLanguageResolver,
      ],
    }),
    ObservabilityModule,
    DataLoaderModule,
    PrismaModule,
    FtsModule,
    JobsModule,
    SmsModule,
    NotificationsModule,
    IntegrationsModule,
    AuthModule,
    EventsModule,
    HealthModule,
    ItemsModule,
    TagsModule,
    HighlightsModule,
    TokensModule,
    ExportModule,
    KoboModule,
    ...devOnlyModules,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
