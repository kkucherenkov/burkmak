/**
 * Sentry initialisation.
 *
 * This module runs BEFORE NestJS DI boots, so we read process.env directly
 * rather than going through AppConfig. This is the sole exception to the
 * "no process.env outside common/config" rule — there is no DI container yet.
 *
 * Call initSentry() as the very first statement inside bootstrap() so that
 * Sentry instruments Node.js internals before any other module is loaded.
 */
import * as Sentry from '@sentry/node';

export function initSentry(): void {
  const dsn = process.env['SENTRY_DSN'];
  if (!dsn) {
    // DSN not set — Sentry is disabled (dev / test / self-hosted without Sentry).
    return;
  }

  const nodeEnv = process.env['NODE_ENV'] ?? 'development';

  Sentry.init({
    dsn,
    environment: nodeEnv,
    // Low sample rate in production to limit ingestion cost; full rate otherwise.
    tracesSampleRate: nodeEnv === 'production' ? 0.1 : 1,
  });
}
