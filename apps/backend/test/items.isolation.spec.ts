import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaService } from '../src/common/prisma/prisma.service';
import { ItemRepo } from '../src/modules/items/infra/item.repo';
import { TagRepo } from '../src/modules/tags/infra/tag.repo';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.join(HERE, '..');
const DB_FILE = path.join(HERE, 'tmp-isolation.db');
const DB_URL = `file:${DB_FILE}`;

function cleanup(): void {
  for (const f of [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`]) {
    if (existsSync(f)) rmSync(f);
  }
}

let prisma: PrismaService;
let items: ItemRepo;
let tags: TagRepo;

beforeAll(async () => {
  cleanup();
  // Push schema to temp SQLite DB via local prisma binary.
  // prisma.config.ts reads process.env.DATABASE_URL — pass it via env.
  // Note: --skip-generate is not a valid flag in Prisma 7; omit it.
  execSync('./node_modules/.bin/prisma db push --accept-data-loss', {
    cwd: BACKEND_DIR,
    env: { ...process.env, DATABASE_URL: DB_URL },
    stdio: 'pipe',
  });
  // PrismaService constructor only reads config.databaseUrl, so a minimal
  // object cast to never is sufficient — no other field is accessed at init.
  prisma = new PrismaService({ databaseUrl: DB_URL } as never);
  await prisma.onModuleInit();
  items = new ItemRepo(prisma);
  tags = new TagRepo(prisma);
}, 60_000);

afterAll(async () => {
  if (prisma) await prisma.onModuleDestroy();
  cleanup();
});

describe('multi-user item isolation', () => {
  it('scopes every read/write to the owning user', async () => {
    const bId = await items.create({ userId: 'userB', url: 'https://b.example.com' });
    const aId = await items.create({ userId: 'userA', url: 'https://a.example.com' });

    // A cannot see/mutate B's item
    expect(await items.findById('userA', bId)).toBeNull();
    expect(await items.update('userA', bId, { favorite: true })).toBe(false);
    expect(await items.addTag('userA', bId, 'sneaky')).toBe(false);
    expect(await items.delete('userA', bId)).toBe(false);

    // A's list excludes B's item, includes A's own
    const aList = await items.findMany({ userId: 'userA', limit: 50 });
    const aIds = aList.items.map((i) => i.id);
    expect(aIds).toContain(aId);
    expect(aIds).not.toContain(bId);

    // B (owner) still can — proves the rejections above were ownership, not a broken row
    expect(await items.findById('userB', bId)).not.toBeNull();
    expect(await items.update('userB', bId, { readState: 'read' })).toBe(true);
    expect(await items.delete('userB', bId)).toBe(true);
  });

  it('scopes tags per user', async () => {
    const aId = await items.create({ userId: 'userA', url: 'https://a2.example.com' });
    expect(await items.addTag('userA', aId, 'Tech News')).toBe(true);

    const aTags = await tags.listForUser('userA');
    const bTags = await tags.listForUser('userB');
    expect(aTags.some((t) => t.slug === 'tech-news')).toBe(true);
    expect(bTags.some((t) => t.slug === 'tech-news')).toBe(false);
  });
});

/**
 * `buildItemWhere`'s kind clause against a real database. Asserting the shape of
 * the returned object literal (see item.repo.spec.ts) passes whether or not
 * Prisma honours the clause — only a real query proves the filter.
 *
 * The FTS (`q`) branch of the same helper is covered in s2.isolation.spec.ts,
 * which owns the FTS5 DDL.
 */
describe('ItemRepo.findMany kind filter (plain path)', () => {
  let articleId: string;
  let bookmarkId: string;

  beforeAll(async () => {
    articleId = await items.create({
      userId: 'userK',
      url: 'https://k.example.com/article',
      kind: 'article',
    });
    bookmarkId = await items.create({
      userId: 'userK',
      url: 'https://k.example.com/bookmark',
      kind: 'bookmark',
    });
  });

  it('kind: article returns only articles', async () => {
    const { items: rows } = await items.findMany({ userId: 'userK', limit: 50, kind: 'article' });
    const ids = rows.map((i) => i.id);
    expect(ids).toContain(articleId);
    expect(ids).not.toContain(bookmarkId);
    expect(rows.every((i) => i.kind === 'article')).toBe(true);
  });

  it('kind: bookmark returns only bookmarks', async () => {
    const { items: rows } = await items.findMany({ userId: 'userK', limit: 50, kind: 'bookmark' });
    const ids = rows.map((i) => i.id);
    expect(ids).toContain(bookmarkId);
    expect(ids).not.toContain(articleId);
    expect(rows.every((i) => i.kind === 'bookmark')).toBe(true);
  });

  it('no kind filter returns both kinds (list stays backward-compatible)', async () => {
    const { items: rows } = await items.findMany({ userId: 'userK', limit: 50 });
    const ids = rows.map((i) => i.id);
    expect(ids).toContain(articleId);
    expect(ids).toContain(bookmarkId);
  });
});
