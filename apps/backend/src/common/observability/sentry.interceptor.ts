import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import type { Observable } from 'rxjs';

/**
 * Forwards unhandled exceptions to Sentry.
 *
 * Only 5xx (server) errors are captured — 4xx (client) errors are operational
 * and expected; capturing them would pollute the Sentry issue list with noise.
 *
 * HttpExceptionFilter also calls Sentry.captureException for 5xx so that
 * errors thrown directly from filters (outside the interceptor chain) are
 * still tracked.
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (this.isServerError(error)) {
          Sentry.captureException(error);
        }
        return throwError(() => error);
      }),
    );
  }

  private isServerError(error: unknown): boolean {
    if (error instanceof HttpException) {
      return error.getStatus() >= 500;
    }
    // Non-HttpException errors are unhandled — always capture.
    return true;
  }
}
