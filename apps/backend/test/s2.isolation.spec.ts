/**
 * S2 multi-user isolation: article / image / highlights / FTS
 *
 * Mirrors the pattern from items.isolation.spec.ts:
 *  - temp SQLite DB via `prisma db push`
 *  - repos instantiated directly (repo-layer focus — fast, and ownership
 *    scoping needs no HTTP). Full-app boot over SQLite now works once Better
 *    Auth's provider matches the datasource — see auth-sqlite-boot.spec.ts.
 *  - FTS DDL applied manually so article body indexing works
 *
 * What is under test:
 *  - ArticleRepo.findByItem enforces userId scoping (join on item.userId)
 *  - HighlightRepo.create / listForItem / update / remove enforce ownership
 *  - ItemRepo.applyExtractStatus enforces ownership (used by extract command)
 *  - ItemRepo.findMany (FTS branch) is userId-scoped: A cannot see B's article text
 */

import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaService } from '../src/common/prisma/prisma.service';
import { ArticleRepo } from '../src/modules/items/infra/article.repo';
import { ItemRepo } from '../src/modules/items/infra/item.repo';
import { HighlightRepo } from '../src/modules/highlights/infra/highlight.repo';
import { ShelfRepo } from '../src/modules/shelves/infra/shelf.repo';
import { ItemNotFoundError } from '../src/modules/items/domain/items.errors';
import { HighlightNotFoundError } from '../src/modules/highlights/domain/highlights.errors';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.join(HERE, '..');
const DB_FILE = path.join(HERE, 'tmp-s2-isolation.db');
const DB_URL = `file:${DB_FILE}`;

/** Unique phrase only present in B's article body. */
const UNIQUE_PHRASE = 'ztxqwophrase';

/** Unique token shared by K's article + bookmark — exercises the FTS kind filter. */
const KIND_PHRASE = 'zkindphrase';

/** Unique token shared by S's two items — exercises the shelf filter on the FTS path. */
const SHELF_PHRASE = 'zshelfphrase';
let sShelfId: string;
let sOnShelfId: string;
let sOffShelfId: string;

function cleanup(): void {
  for (const f of [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`]) {
    if (existsSync(f)) rmSync(f);
  }
}

let prisma: PrismaService;
let items: ItemRepo;
let articles: ArticleRepo;
let highlights: HighlightRepo;
let shelfRepo: ShelfRepo;

// Seeded IDs — populated in beforeAll
let bItemId: string;
let bHighlightId: string;
let aItemId: string;
let kArticleId: string;
let kBookmarkId: string;

const FTS_DDL = [
  `CREATE VIRTUAL TABLE IF NOT EXISTS item_fts USING fts5(
    title, url, body, item_id UNINDEXED, tokenize = 'porter unicode61'
  )`,

  `CREATE TRIGGER IF NOT EXISTS item_fts_ai AFTER INSERT ON item BEGIN
    INSERT INTO item_fts(title, url, body, item_id)
    VALUES (new.title, new.url, '', new.id);
  END`,

  `CREATE TRIGGER IF NOT EXISTS item_fts_au AFTER UPDATE ON item BEGIN
    UPDATE item_fts SET title = new.title, url = new.url WHERE item_id = new.id;
  END`,

  `CREATE TRIGGER IF NOT EXISTS item_fts_ad AFTER DELETE ON item BEGIN
    DELETE FROM item_fts WHERE item_id = old.id;
  END`,

  `CREATE TRIGGER IF NOT EXISTS article_fts_ai AFTER INSERT ON article BEGIN
    UPDATE item_fts SET body = new.contentText WHERE item_id = new.itemId;
  END`,

  `CREATE TRIGGER IF NOT EXISTS article_fts_au AFTER UPDATE ON article BEGIN
    UPDATE item_fts SET body = new.contentText WHERE item_id = new.itemId;
  END`,
];

beforeAll(async () => {
  cleanup();

  // Push Prisma schema to a throw-away SQLite file.
  execSync('./node_modules/.bin/prisma db push --accept-data-loss', {
    cwd: BACKEND_DIR,
    env: { ...process.env, DATABASE_URL: DB_URL },
    stdio: 'pipe',
  });

  prisma = new PrismaService({ databaseUrl: DB_URL } as never);
  await prisma.onModuleInit();

  // Apply FTS5 virtual table + sync triggers (mirrors FtsBootstrapService).
  for (const stmt of FTS_DDL) {
    await prisma.$executeRawUnsafe(stmt);
  }

  items = new ItemRepo(prisma);
  articles = new ArticleRepo(prisma);
  highlights = new HighlightRepo(prisma);
  shelfRepo = new ShelfRepo(prisma);

  // ── Seed A ───────────────────────────────────────────────────────────────
  aItemId = await items.create({ userId: 'userA', url: 'https://a.example.com/article' });
  // Upsert article for A (contentText does NOT contain the unique phrase)
  await articles.upsert(aItemId, {
    contentHtml: '<p>Some article for user A.</p>',
    contentText: 'Some article for user A.',
    wordCount: 5,
    readingTimeMin: 1,
    coverImageKey: null,
  });
  await items.setExtractStatus(aItemId, 'ready');

  // ── Seed B ───────────────────────────────────────────────────────────────
  bItemId = await items.create({ userId: 'userB', url: 'https://b.example.com/article' });
  // Article body contains the unique phrase — visible in FTS for B, invisible to A
  await articles.upsert(bItemId, {
    contentHtml: `<p>This is a secret article. ${UNIQUE_PHRASE} is here.</p>`,
    contentText: `This is a secret article. ${UNIQUE_PHRASE} is here.`,
    wordCount: 9,
    readingTimeMin: 1,
    coverImageKey: null,
  });
  await items.setExtractStatus(bItemId, 'ready');

  // B creates a highlight on B's item
  const bHighlight = await highlights.create('userB', bItemId, {
    quote: 'secret article',
    prefix: 'a ',
    suffix: '.',
    color: 'yellow',
  });
  bHighlightId = bHighlight.id;

  // ── Seed K: one article + one bookmark that both match the same FTS token ──
  // (the url is FTS-indexed on insert, so a bookmark with no Article row still
  // matches — which is exactly the case the kind filter has to separate)
  kArticleId = await items.create({
    userId: 'userK',
    url: `https://k.example.com/${KIND_PHRASE}/article`,
    kind: 'article',
  });
  kBookmarkId = await items.create({
    userId: 'userK',
    url: `https://k.example.com/${KIND_PHRASE}/bookmark`,
    kind: 'bookmark',
  });

  // ── Seed S: two items matching one FTS token, only one of them shelved ──
  sOnShelfId = await items.create({
    userId: 'userS',
    url: `https://s.example.com/${SHELF_PHRASE}/on`,
  });
  sOffShelfId = await items.create({
    userId: 'userS',
    url: `https://s.example.com/${SHELF_PHRASE}/off`,
  });
  sShelfId = await shelfRepo.create('userS', 'Seeded');
  await shelfRepo.addItem('userS', sShelfId, sOnShelfId);
}, 60_000);

afterAll(async () => {
  if (prisma) await prisma.onModuleDestroy();
  cleanup();
});

describe('S2 multi-user isolation', () => {
  // ── Article isolation ────────────────────────────────────────────────────

  it('A cannot read B article via ArticleRepo (returns null, mapped to 404)', async () => {
    const result = await articles.findByItem('userA', bItemId);
    expect(result).toBeNull();
  });

  it('B can read own article', async () => {
    const result = await articles.findByItem('userB', bItemId);
    expect(result).not.toBeNull();
    expect(result?.contentText).toContain(UNIQUE_PHRASE);
  });

  // ── Extract isolation (applyExtractStatus = ownership-checked write) ─────

  it('A cannot trigger extract on B item (applyExtractStatus returns false)', async () => {
    const ok = await items.applyExtractStatus('userA', bItemId, 'extracting');
    expect(ok).toBe(false);
  });

  it('B can trigger extract on own item (applyExtractStatus returns true)', async () => {
    const ok = await items.applyExtractStatus('userB', bItemId, 'extracting');
    expect(ok).toBe(true);
    // restore
    await items.applyExtractStatus('userB', bItemId, 'ready');
  });

  // ── Image isolation (via ItemRepo.findById ownership check) ──────────────

  it('A cannot verify image ownership for B item (findById returns null)', async () => {
    const item = await items.findById('userA', bItemId);
    expect(item).toBeNull();
  });

  it('B can verify image ownership for own item', async () => {
    const item = await items.findById('userB', bItemId);
    expect(item).not.toBeNull();
  });

  // ── Highlights isolation — list ──────────────────────────────────────────

  it('A cannot list B highlights (ItemNotFoundError)', async () => {
    await expect(highlights.listForItem('userA', bItemId)).rejects.toBeInstanceOf(
      ItemNotFoundError,
    );
  });

  it('B can list own highlights', async () => {
    const list = await highlights.listForItem('userB', bItemId);
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(bHighlightId);
  });

  // ── Highlights isolation — create ────────────────────────────────────────

  it('A cannot create highlight on B item (ItemNotFoundError)', async () => {
    await expect(
      highlights.create('userA', bItemId, { quote: 'secret', color: 'red' }),
    ).rejects.toBeInstanceOf(ItemNotFoundError);
  });

  // ── Highlights isolation — update ────────────────────────────────────────

  it('A cannot update B highlight (HighlightNotFoundError)', async () => {
    await expect(
      highlights.update('userA', bHighlightId, { note: 'sneaky' }),
    ).rejects.toBeInstanceOf(HighlightNotFoundError);
  });

  it('B can update own highlight', async () => {
    const updated = await highlights.update('userB', bHighlightId, { note: 'my note' });
    expect(updated.note).toBe('my note');
    // restore
    await highlights.update('userB', bHighlightId, { note: null });
  });

  // ── Highlights isolation — delete ────────────────────────────────────────

  it('A cannot delete B highlight (HighlightNotFoundError)', async () => {
    await expect(highlights.remove('userA', bHighlightId)).rejects.toBeInstanceOf(
      HighlightNotFoundError,
    );
  });

  // ── FTS isolation — A cannot find B unique phrase ────────────────────────

  it('A FTS search for unique phrase returns zero items (body is userId-scoped)', async () => {
    const result = await items.findMany({
      userId: 'userA',
      limit: 50,
      q: UNIQUE_PHRASE,
    });
    const ids = result.items.map((i) => i.id);
    expect(ids).not.toContain(bItemId);
    expect(ids.length).toBe(0);
  });

  it('B FTS search for unique phrase returns B own item (positive FTS control)', async () => {
    const result = await items.findMany({
      userId: 'userB',
      limit: 50,
      q: UNIQUE_PHRASE,
    });
    const ids = result.items.map((i) => i.id);
    expect(ids).toContain(bItemId);
  });

  // ── Positive control: A can access own article/highlight ─────────────────

  it('A can read own article (positive control)', async () => {
    const article = await articles.findByItem('userA', aItemId);
    expect(article).not.toBeNull();
    expect(article?.itemId).toBe(aItemId);
  });

  it('A can create, list, update, delete own highlight (positive control)', async () => {
    const hl = await highlights.create('userA', aItemId, {
      quote: 'Some article',
      prefix: '',
      suffix: '.',
      color: 'blue',
    });
    expect(hl.id).toBeTruthy();
    expect(hl.color).toBe('blue');

    const list = await highlights.listForItem('userA', aItemId);
    expect(list.some((h) => h.id === hl.id)).toBe(true);

    const patched = await highlights.update('userA', hl.id, { note: 'noted' });
    expect(patched.note).toBe('noted');

    await expect(highlights.remove('userA', hl.id)).resolves.toBeUndefined();

    const afterDelete = await highlights.listForItem('userA', aItemId);
    expect(afterDelete.some((h) => h.id === hl.id)).toBe(false);
  });
});

/**
 * `buildItemWhere`'s kind clause on the FTS branch. It feeds both `findManyPlain`
 * and `findManyFts`, so both paths need real-DB proof — asserting the shape of the
 * returned object literal (see item.repo.spec.ts) passes whether or not Prisma
 * honours the clause. The plain path is covered in items.isolation.spec.ts.
 */
describe('ItemRepo.findMany kind filter (FTS path)', () => {
  it('q + kind: article returns only articles', async () => {
    const { items: rows } = await items.findMany({
      userId: 'userK',
      limit: 50,
      q: KIND_PHRASE,
      kind: 'article',
    });
    const ids = rows.map((i) => i.id);
    expect(ids).toContain(kArticleId);
    expect(ids).not.toContain(kBookmarkId);
    expect(rows.every((i) => i.kind === 'article')).toBe(true);
  });

  it('q + kind: bookmark returns only bookmarks', async () => {
    const { items: rows } = await items.findMany({
      userId: 'userK',
      limit: 50,
      q: KIND_PHRASE,
      kind: 'bookmark',
    });
    const ids = rows.map((i) => i.id);
    expect(ids).toContain(kBookmarkId);
    expect(ids).not.toContain(kArticleId);
    expect(rows.every((i) => i.kind === 'bookmark')).toBe(true);
  });

  it('q with no kind filter returns both kinds (positive FTS control)', async () => {
    const { items: rows } = await items.findMany({ userId: 'userK', limit: 50, q: KIND_PHRASE });
    const ids = rows.map((i) => i.id);
    expect(ids).toContain(kArticleId);
    expect(ids).toContain(kBookmarkId);
  });
});

/**
 * The `?shelf=` clause on both list paths. `buildItemWhere` feeds findManyPlain
 * AND findManyFts, so both need real-DB proof — asserting the shape of the
 * returned object literal (see item.repo.spec.ts) passes whether or not Prisma
 * honours the clause.
 */
describe('ItemRepo.findMany shelf filter', () => {
  it('returns only items on the shelf', async () => {
    const { items: rows } = await items.findMany({ userId: 'userS', limit: 50, shelf: sShelfId });
    const ids = rows.map((i) => i.id);
    expect(ids).toContain(sOnShelfId);
    expect(ids).not.toContain(sOffShelfId);
  });

  it('combines with q on the FTS path, and carries the shelves array', async () => {
    const { items: rows } = await items.findMany({
      userId: 'userS',
      limit: 50,
      q: SHELF_PHRASE,
      shelf: sShelfId,
    });
    const ids = rows.map((i) => i.id);
    expect(ids).toEqual([sOnShelfId]);
    // `Item.shelves` is required by the spec; findManyFts is the one
    // ItemDetail-producing path with no other direct test of that field.
    expect(rows[0]?.shelves).toEqual([{ id: sShelfId, name: 'Seeded' }]);
  });

  it('unfiltered returns both', async () => {
    const { items: rows } = await items.findMany({ userId: 'userS', limit: 50 });
    const ids = rows.map((i) => i.id);
    expect(ids).toContain(sOnShelfId);
    expect(ids).toContain(sOffShelfId);
  });
});

/**
 * The read-side half of the article-only invariant. `ShelfRepo.ownsBoth`
 * guards entry (Task: shelf.repo.ts), but an already-shelved article can be
 * demoted to a bookmark via `PATCH /items/{id}` without ever touching that
 * write path — the membership row just lingers. `buildItemWhere` must retract
 * it from `?shelf=` reads while demoted, and — because we deliberately do NOT
 * delete the membership row on demote — restore it on re-promotion with no
 * further shelf action from the user. This is the same lesson slice ②
 * (`kind` filter) learned: a filter guards entry, not state already written.
 */
describe('shelf read guard: demote hides membership, re-promote restores it', () => {
  it('a demoted article disappears from ?shelf=; re-promoted, it reappears', async () => {
    const itemId = await items.create({
      userId: 'userS',
      url: 'https://s.example.com/demote-repromote',
    });
    const shelfId = await shelfRepo.create('userS', 'DemoteRepromote');
    expect(await shelfRepo.addItem('userS', shelfId, itemId)).toBe(true);

    // visible while it's an article
    let result = await items.findMany({ userId: 'userS', limit: 50, shelf: shelfId });
    expect(result.items.map((i) => i.id)).toContain(itemId);

    // demoted — the write path (shelf.repo.ts) never runs; the membership row lingers
    expect(await items.update('userS', itemId, { kind: 'bookmark' })).toBe(true);
    result = await items.findMany({ userId: 'userS', limit: 50, shelf: shelfId });
    expect(result.items.map((i) => i.id)).not.toContain(itemId);

    // re-promoted — reappears without the user re-adding it to the shelf
    expect(await items.update('userS', itemId, { kind: 'article' })).toBe(true);
    result = await items.findMany({ userId: 'userS', limit: 50, shelf: shelfId });
    expect(result.items.map((i) => i.id)).toContain(itemId);
  });
});
