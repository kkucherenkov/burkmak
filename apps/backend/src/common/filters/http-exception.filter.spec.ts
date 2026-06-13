import { BadRequestException, HttpException, type ArgumentsHost } from '@nestjs/common';
import { describe, it, expect, vi } from 'vitest';

import { DomainError } from '../errors/domain-error';
import { HttpExceptionFilter } from './http-exception.filter';

class TestDomainError extends DomainError {
  constructor() {
    super({ code: 'thing-missing', status: 404, title: 'Thing not found', detail: 'No thing.' });
  }
}

function hostFor(method = 'GET', url = '/api/v1/x') {
  const json = { status: 0 as number, body: undefined as unknown };
  const res = {
    status: vi.fn().mockImplementation((s: number) => {
      json.status = s;
      return res;
    }),
    type: vi.fn().mockReturnThis(),
    send: vi.fn().mockImplementation((b: unknown) => {
      json.body = b;
      return res;
    }),
  };
  const req = { method, originalUrl: url, url };
  const host = {
    switchToHttp: () => ({ getResponse: () => res, getRequest: () => req }),
  } as unknown as ArgumentsHost;
  return { host, json };
}

describe('HttpExceptionFilter', () => {
  it('maps a DomainError to its status + problem code', () => {
    const { host, json } = hostFor();
    new HttpExceptionFilter().catch(new TestDomainError(), host);
    expect(json.status).toBe(404);
    expect(json.body).toMatchObject({
      status: 404,
      code: 'thing-missing',
      title: 'Thing not found',
    });
  });

  it('maps a Nest HttpException to its status', () => {
    const { host, json } = hostFor();
    new HttpExceptionFilter().catch(new BadRequestException('nope'), host);
    expect(json.status).toBe(400);
    expect((json.body as { status: number }).status).toBe(400);
  });

  it('maps an express-openapi-validator style status error (404) instead of 500', () => {
    const { host, json } = hostFor('GET', '/api/v1/nope');
    const validatorError = Object.assign(new Error('not found'), { status: 404, errors: [] });
    new HttpExceptionFilter().catch(validatorError, host);
    expect(json.status).toBe(404);
    expect(json.body).toMatchObject({ status: 404, title: 'Not Found', detail: 'not found' });
  });

  it('maps a validator 400 (bad request body) with its errors array', () => {
    const { host, json } = hostFor('POST', '/api/v1/items');
    const validatorError = Object.assign(new Error('request.body.url required'), {
      status: 400,
      errors: [{ path: '.body.url', message: 'required' }],
    });
    new HttpExceptionFilter().catch(validatorError, host);
    expect(json.status).toBe(400);
    expect(json.body).toMatchObject({ status: 400, title: 'Bad Request' });
    expect((json.body as { errors: unknown[] }).errors).toHaveLength(1);
  });

  it('falls back to 500 for an unknown error', () => {
    const { host, json } = hostFor();
    new HttpExceptionFilter().catch(new Error('boom'), host);
    expect(json.status).toBe(500);
    expect((json.body as { status: number }).status).toBe(500);
  });

  it('does not treat a plain HttpException as a status-bearing error twice', () => {
    const { host, json } = hostFor();
    new HttpExceptionFilter().catch(new HttpException('teapot', 418), host);
    expect(json.status).toBe(418);
  });
});
