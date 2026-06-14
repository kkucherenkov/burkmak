/**
 * Integration: the full Nest app boots and Better Auth round-trips against the
 * real SQLite datasource.
 *
 * Regression guard for a template leftover: `prismaAdapter` shipped pinned to
 * `provider: 'postgresql'` (monorepo baseline) and the later "switch Prisma to
 * SQLite" migration never updated it, so the adapter dialect disagreed with the
 * datasource. The team believed this blocked booting the app in vitest and
 * worked around it with repo-layer-only isolation tests. It does not — and once
 * the provider matches the datasource, full HTTP/auth integration tests are
 * straightforward. This test proves both: AppModule boots over SQLite and an
 * email/password sign-up + bearer session round-trips through the real DI graph.
 */

import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';
import { AuthService } from '../src/common/auth/auth.service';

import type { INestApplication } from '@nestjs/common';
import type { Request } from 'express';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.join(HERE, '..');
const DB_FILE = path.join(HERE, 'tmp-auth-sqlite-boot.db');
const DB_URL = `file:${DB_FILE}`;

function cleanup(): void {
  for (const f of [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`]) {
    if (existsSync(f)) rmSync(f);
  }
}

let app: INestApplication;
let auth: AuthService;

beforeAll(async () => {
  cleanup();

  // Apply committed migrations to a throw-away SQLite file (migrations-only
  // policy: no `prisma db push`). Creates the Better Auth tables too.
  execSync('./node_modules/.bin/prisma migrate deploy', {
    cwd: BACKEND_DIR,
    env: { ...process.env, DATABASE_URL: DB_URL },
    stdio: 'pipe',
  });

  process.env['DATABASE_URL'] = DB_URL;
  process.env['BETTER_AUTH_SECRET'] = 'test-secret-at-least-32-characters-long-000000';
  process.env['BETTER_AUTH_URL'] = 'http://localhost:3000';
  process.env['NODE_ENV'] = 'test';

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  await app.init();
  auth = app.get(AuthService);
}, 60_000);

afterAll(async () => {
  if (app) await app.close();
  cleanup();
});

describe('Better Auth over SQLite', () => {
  it('boots the full Nest application against SQLite', () => {
    expect(app).toBeTruthy();
    expect(auth.auth).toBeTruthy();
  });

  it('email/password sign-up succeeds against the SQLite datasource', async () => {
    const result = await auth.auth.api.signUpEmail({
      body: {
        email: 'reader@example.com',
        password: 'correct-horse-battery-staple',
        name: 'Reader One',
      },
    });

    expect(result.user.email).toBe('reader@example.com');
    expect(result.user.id).toMatch(/^[0-9a-f-]{36}$/); // UUID v4 per advanced.database.generateId
  });

  it('a session derived from the bearer token round-trips', async () => {
    const signUp = await auth.auth.api.signUpEmail({
      body: {
        email: 'reader2@example.com',
        password: 'correct-horse-battery-staple',
        name: 'Reader Two',
      },
      returnHeaders: true,
    });

    const token = signUp.headers.get('set-auth-token');
    expect(token, 'bearer plugin should mint a token on sign-up').toBeTruthy();

    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const session = await auth.getSession(req);
    expect(session?.user.email).toBe('reader2@example.com');
  });
});
