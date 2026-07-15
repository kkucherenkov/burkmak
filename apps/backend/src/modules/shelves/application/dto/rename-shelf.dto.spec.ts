import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, it, expect } from 'vitest';

import { RenameShelfDto } from './rename-shelf.dto';

// Mirrors the global ValidationPipe in src/main.ts (transform: true, so
// class-transformer's @Transform runs before class-validator's constraints).
const PIPE_OPTIONS = { whitelist: true, forbidNonWhitelisted: true };

describe('RenameShelfDto', () => {
  it('trims a name padded with whitespace', () => {
    const instance = plainToInstance(RenameShelfDto, { name: '  Reading  ' });
    expect(instance.name).toBe('Reading');
  });

  it('rejects a whitespace-only name (trims to empty, fails @Length min 1)', async () => {
    const instance = plainToInstance(RenameShelfDto, { name: '   ' });
    expect(instance.name).toBe('');
    const errors = await validate(instance, PIPE_OPTIONS);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError?.constraints).toHaveProperty('isLength');
  });

  it('accepts a plain, already-trimmed name', async () => {
    const instance = plainToInstance(RenameShelfDto, { name: 'Reading' });
    expect(await validate(instance, PIPE_OPTIONS)).toHaveLength(0);
  });
});
