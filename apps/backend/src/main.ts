import 'reflect-metadata';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AppConfig } from './common/config/app-config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { registerOpenApiValidator } from './common/openapi/openapi-validator.middleware';

import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(AppConfig);
  const { port, nodeEnv, corsOrigins } = config.runtime;

  app.set('trust proxy', 'loopback');
  app.use(nodeEnv === 'production' ? helmet() : helmet({ contentSecurityPolicy: false }));

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  registerOpenApiValidator(app, nodeEnv);

  app.enableShutdownHooks();

  process.on('SIGTERM', () => {
    void app.close();
  });

  await app.listen(port, '0.0.0.0');
  Logger.log(
    `Backend listening on http://localhost:${String(port)}/api/v1 (env=${nodeEnv})`,
    'Bootstrap',
  );
}

bootstrap().catch((error: unknown) => {
  Logger.error(`Failed to bootstrap: ${String(error)}`, undefined, 'Bootstrap');
  process.exit(1);
});
