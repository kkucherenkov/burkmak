import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { generateToken, hashToken, PAT_PREFIX } from '../src/modules/tokens/infra/pat.crypto';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { PrismaTokensRepo } from '../src/modules/tokens/infra/prisma-tokens.repo';
import { PatService } from '../src/common/auth/pat.service';

// ---- crypto unit tests ----

describe('pat.crypto', () => {
  it('generates a prefixed url-safe secret + a stable sha256 hash + display prefix', () => {
    const { secret, hash, prefix } = generateToken();
    expect(secret.startsWith(PAT_PREFIX)).toBe(true);
    expect(secret).toMatch(/^burk_pat_[A-Za-z0-9_-]{20,}$/);
    expect(hash).toBe(hashToken(secret));
    expect(hash).toHaveLength(64); // sha256 hex
    expect(secret.startsWith(prefix)).toBe(true);
    expect(prefix.length).toBeLessThan(secret.length);
  });
  it('hashes deterministically and differs per secret', () => {
    expect(hashToken('burk_pat_a')).toBe(hashToken('burk_pat_a'));
    expect(hashToken('burk_pat_a')).not.toBe(hashToken('burk_pat_b'));
  });
});

// ---- repo integration tests (temp SQLite via migrate deploy) ----

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.join(HERE, '..');
const DB_FILE = path.join(HERE, 'tmp-tokens-isolation.db');
const DB_URL = `file:${DB_FILE}`;

function cleanup(): void {
  for (const f of [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`]) {
    if (existsSync(f)) rmSync(f);
  }
}

let prisma: PrismaService;
let repo: PrismaTokensRepo;
let patService: PatService;

// Seed a minimal user row so FK constraints are satisfied.
const USER_A = 'user-a-pat-test';
const USER_B = 'user-b-pat-test';

beforeAll(async () => {
  cleanup();
  execSync('./node_modules/.bin/prisma migrate deploy', {
    cwd: BACKEND_DIR,
    env: { ...process.env, DATABASE_URL: DB_URL },
    stdio: 'pipe',
  });
  prisma = new PrismaService({ databaseUrl: DB_URL } as never);
  await prisma.onModuleInit();

  // Insert seed users directly — only Better Auth manages `user` normally,
  // but in isolation tests we insert bare rows satisfying NOT NULL constraints.
  await prisma.$executeRawUnsafe(
    `INSERT OR IGNORE INTO "user" (id, name, email, emailVerified, createdAt, updatedAt)
     VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    USER_A,
    'User A',
    'user-a@test.internal',
  );
  await prisma.$executeRawUnsafe(
    `INSERT OR IGNORE INTO "user" (id, name, email, emailVerified, createdAt, updatedAt)
     VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    USER_B,
    'User B',
    'user-b@test.internal',
  );

  repo = new PrismaTokensRepo(prisma);
  patService = new PatService(repo);
}, 60_000);

afterAll(async () => {
  if (prisma) await prisma.onModuleDestroy();
  cleanup();
});

describe('PrismaTokensRepo', () => {
  it('create → listForUser returns the record (no hash/secret exposed)', async () => {
    const { secret, hash, prefix } = generateToken();
    const rec = await repo.create({ userId: USER_A, name: 'My Token', tokenHash: hash, prefix });
    expect(rec.id).toBeTruthy();
    expect(rec.name).toBe('My Token');
    expect(rec.prefix).toBe(prefix);
    expect(rec.lastUsedAt).toBeNull();
    // Verify list returns it
    const list = await repo.listForUser(USER_A);
    expect(list.some((t) => t.id === rec.id)).toBe(true);
    // No hash/secret on the record shape
    expect((rec as unknown as Record<string, unknown>)['tokenHash']).toBeUndefined();
    expect((rec as unknown as Record<string, unknown>)['secret']).toBeUndefined();
    // cleanup ref for next tests
    void secret; // used to derive hash above
  });

  it('findActiveByHash returns the token row', async () => {
    const { secret, hash, prefix } = generateToken();
    const rec = await repo.create({ userId: USER_A, name: 'Find Me', tokenHash: hash, prefix });
    const found = await repo.findActiveByHash(hash);
    expect(found).not.toBeNull();
    expect(found?.userId).toBe(USER_A);
    expect(found?.id).toBe(rec.id);
    void secret;
  });

  it('revoke → findActiveByHash returns null', async () => {
    const { secret, hash, prefix } = generateToken();
    const rec = await repo.create({
      userId: USER_A,
      name: 'Revoke Me',
      tokenHash: hash,
      prefix,
    });
    const revoked = await repo.revoke(USER_A, rec.id);
    expect(revoked).toBe(true);
    expect(await repo.findActiveByHash(hash)).toBeNull();
    void secret;
  });

  it('another user cannot revoke (returns false)', async () => {
    const { secret, hash, prefix } = generateToken();
    const rec = await repo.create({
      userId: USER_A,
      name: 'Protected',
      tokenHash: hash,
      prefix,
    });
    const result = await repo.revoke(USER_B, rec.id);
    expect(result).toBe(false);
    // Token still active for owner
    expect(await repo.findActiveByHash(hash)).not.toBeNull();
    void secret;
  });

  it('touch sets lastUsedAt', async () => {
    const { secret, hash, prefix } = generateToken();
    const rec = await repo.create({ userId: USER_A, name: 'Touch Me', tokenHash: hash, prefix });
    await repo.touch(rec.id);
    const list = await repo.listForUser(USER_A);
    const updated = list.find((t) => t.id === rec.id);
    expect(updated?.lastUsedAt).not.toBeNull();
    void secret;
  });
});

describe('PatService.resolve', () => {
  function req(authorization: string): { headers: Record<string, unknown> } {
    return { headers: { authorization } };
  }

  it('Bearer burk_pat_ → resolves userId + touch called', async () => {
    const { secret, hash, prefix } = generateToken();
    const rec = await repo.create({
      userId: USER_A,
      name: 'Service Bearer Test',
      tokenHash: hash,
      prefix,
    });
    const touchSpy = vi.spyOn(repo, 'touch');
    const userId = await patService.resolve(req(`Bearer ${secret}`));
    expect(userId).toBe(USER_A);
    // touch is fire-and-forget; give it a tick to run
    await new Promise((r) => setImmediate(r));
    expect(touchSpy).toHaveBeenCalledWith(rec.id);
    touchSpy.mockRestore();
  });

  it('Basic header with burk_pat_ password → resolves userId', async () => {
    const { secret, hash, prefix } = generateToken();
    await repo.create({
      userId: USER_A,
      name: 'Service Basic Test',
      tokenHash: hash,
      prefix,
    });
    const b64 = Buffer.from(`ignored:${secret}`).toString('base64');
    const userId = await patService.resolve(req(`Basic ${b64}`));
    expect(userId).toBe(USER_A);
  });

  it('Better-Auth-style bearer (no burk_pat_ prefix) → null (not mistaken for a PAT)', async () => {
    // A session bearer from Better Auth never starts with burk_pat_
    const fakeSessionToken = 'eyJhbGciOiJIUzI1NiJ9.some.payload';
    const userId = await patService.resolve(req(`Bearer ${fakeSessionToken}`));
    expect(userId).toBeNull();
  });

  it('revoked secret → null', async () => {
    const { secret, hash, prefix } = generateToken();
    const rec = await repo.create({
      userId: USER_A,
      name: 'Revoked Resolve Test',
      tokenHash: hash,
      prefix,
    });
    await repo.revoke(USER_A, rec.id);
    const userId = await patService.resolve(req(`Bearer ${secret}`));
    expect(userId).toBeNull();
  });

  it('unknown secret → null', async () => {
    const { secret } = generateToken(); // never stored
    const userId = await patService.resolve(req(`Bearer ${secret}`));
    expect(userId).toBeNull();
  });
});
