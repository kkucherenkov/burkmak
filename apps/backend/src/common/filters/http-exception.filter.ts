import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { DomainError } from '../errors/domain-error';

import type { Request, Response } from 'express';

interface ProblemDocument {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  code?: string;
  errors?: unknown;
}

/**
 * Errors thrown by `express-openapi-validator` (and similar Express middleware)
 * are plain Errors carrying a numeric `status` (e.g. 400 for a bad request body,
 * 404 for an undocumented route) plus an `errors` array — they are neither
 * `HttpException` nor `DomainError`. Map them to their real status instead of a
 * blanket 500.
 */
interface StatusBearingError {
  status: number;
  message?: unknown;
  errors?: unknown;
}

function isStatusBearingError(err: unknown): err is StatusBearingError {
  if (typeof err !== 'object' || err === null || !('status' in err)) {
    return false;
  }
  const status = (err as { status: unknown }).status;
  return typeof status === 'number' && status >= 400 && status <= 599;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();
    const problem = this.toProblem(exception, request.originalUrl || request.url);

    if (problem.status >= 500) {
      this.logger.error(
        `${request.method} ${problem.instance} — ${problem.title}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(problem.status).type('application/problem+json').send(problem);
  }

  private toProblem(exception: unknown, instance: string): ProblemDocument {
    if (exception instanceof DomainError) {
      const problem: ProblemDocument = {
        type: `urn:problem-type:${exception.code}`,
        title: exception.title,
        status: exception.status,
        instance,
        code: exception.code,
      };
      if (exception.detail !== undefined) {
        problem.detail = exception.detail;
      }
      return problem;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const title = this.titleFor(status);
      if (typeof body === 'string') {
        return { type: 'about:blank', title, status, detail: body, instance };
      }
      const obj = body as Record<string, unknown>;
      const problem: ProblemDocument = {
        type: 'about:blank',
        title: (obj['error'] as string | undefined) ?? title,
        status,
        instance,
      };
      if (typeof obj['message'] === 'string') {
        problem.detail = obj['message'];
      }
      if (Array.isArray(obj['message'])) {
        problem.errors = obj['message'];
      }
      return problem;
    }

    if (isStatusBearingError(exception)) {
      const status = exception.status;
      const problem: ProblemDocument = {
        type: 'about:blank',
        title: this.titleFor(status),
        status,
        instance,
      };
      if (typeof exception.message === 'string' && exception.message.length > 0) {
        problem.detail = exception.message;
      }
      if (Array.isArray(exception.errors)) {
        problem.errors = exception.errors;
      }
      return problem;
    }

    return {
      type: 'about:blank',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      instance,
    };
  }

  private titleFor(status: number): string {
    switch (status) {
      case 400: {
        return 'Bad Request';
      }
      case 401: {
        return 'Unauthorized';
      }
      case 403: {
        return 'Forbidden';
      }
      case 404: {
        return 'Not Found';
      }
      case 409: {
        return 'Conflict';
      }
      case 422: {
        return 'Unprocessable Entity';
      }
      case 429: {
        return 'Too Many Requests';
      }
      default: {
        return status >= 500 ? 'Internal Server Error' : 'Error';
      }
    }
  }
}
