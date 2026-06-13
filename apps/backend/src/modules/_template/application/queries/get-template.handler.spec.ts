/**
 * WHY this file exists:
 * Unit tests for query/command handlers are the core of the test pyramid. They
 * cover business logic with no infrastructure: the repo port is replaced by a
 * vi.fn() mock and the handler is instantiated directly — no NestJS bootstrapping.
 *
 * Pattern:
 *  - makeRepo() builds a typed mock with vi.fn() for every method on the port.
 *  - beforeEach resets state so tests are independent.
 *  - Happy path: set up mock return value, call handler, assert result.
 *  - Error path: return null / throw from mock, assert DomainError subclass.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TemplateNotFoundError } from '../../domain/_template.errors';

import { GetTemplateQuery } from './get-template.query';
import { GetTemplateHandler } from './get-template.handler';

import type { ITemplateRepo, TemplateDetail } from '../../domain/_template.ports';

function makeRepo(): ITemplateRepo {
  return {
    findById: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  };
}

function makeDetail(overrides: Partial<TemplateDetail> = {}): TemplateDetail {
  return {
    id: 'template-1',
    name: 'Reference Template',
    createdAt: '2026-04-22T00:00:00.000Z',
    ...overrides,
  };
}

describe('GetTemplateHandler', () => {
  let repo: ITemplateRepo;
  let handler: GetTemplateHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new GetTemplateHandler(repo);
  });

  it('returns template when found', async () => {
    const detail = makeDetail({ id: 'template-1' });
    vi.mocked(repo.findById).mockResolvedValue(detail);

    const result = await handler.execute(new GetTemplateQuery('template-1'));

    expect(result).toEqual(detail);
    expect(repo.findById).toHaveBeenCalledWith('template-1');
  });

  it('throws TemplateNotFoundError when repo returns null', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);

    await expect(handler.execute(new GetTemplateQuery('missing'))).rejects.toBeInstanceOf(
      TemplateNotFoundError,
    );
  });
});
