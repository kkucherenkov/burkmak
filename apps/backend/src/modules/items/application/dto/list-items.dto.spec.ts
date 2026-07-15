import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, it, expect } from 'vitest';

import { ListItemsDto } from './list-items.dto';

// Mirrors the global ValidationPipe in src/main.ts. `forbidNonWhitelisted`
// is the load-bearing option: it 400s any property the DTO does not decorate,
// so an undecorated field is rejected rather than silently ignored.
// The pipe's `enableImplicitConversion` is omitted: it reads `design:type`
// via reflect-metadata, which swc does not emit here, and every field below
// is a string arriving as a string.
const PIPE_OPTIONS = { whitelist: true, forbidNonWhitelisted: true };

function validateQuery(query: Record<string, unknown>) {
  return validate(plainToInstance(ListItemsDto, query), PIPE_OPTIONS);
}

describe('ListItemsDto', () => {
  it('accepts kind=article', async () => {
    expect(await validateQuery({ kind: 'article' })).toHaveLength(0);
  });

  it('accepts kind=bookmark', async () => {
    expect(await validateQuery({ kind: 'bookmark' })).toHaveLength(0);
  });

  it('rejects an unknown kind on the IsIn constraint', async () => {
    const errors = await validateQuery({ kind: 'bogus' });
    const kindError = errors.find((e) => e.property === 'kind');
    expect(kindError?.constraints).toHaveProperty('isIn');
  });

  it('allows kind to be omitted', async () => {
    expect(await validateQuery({})).toHaveLength(0);
  });
});
