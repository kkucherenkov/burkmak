/**
 * Kobo × Item.kind: a synced article demoted to a bookmark must be retracted
 * from the device.
 *
 * Contract (specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md):
 * bookmarks NEVER reach the Kobo e-reader. The `kind: 'article'` guard on
 * `findUnsyncedReadyItems` only protects *entry* into the pipeline — it never
 * fires for an item that already owns an entitlement row. These tests cover the
 * *retraction* path.
 *
 * Scaffolding follows auth-sqlite-boot.spec.ts, not the older isolation specs:
 *  - temp SQLite DB built from the committed migrations (migrations-only
 *    policy: no `prisma db push`), so the tests run against the schema that
 *    ships rather than a `schema.prisma` snapshot
 *  - real repos + real KoboSyncService against that DB (no Prisma mocks — a
 *    mocked `where` assertion cannot prove Prisma honours the clause)
 */

import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { AppConfig } from '../src/common/config/app-config';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { EpubCache } from '../src/modules/kobo/infra/epub.cache';
import { KoboSyncRepo } from '../src/modules/kobo/store/kobo-sync.repo';
import { KoboSyncService } from '../src/modules/kobo/store/kobo-sync.service';
import { ArticleRepo } from '../src/modules/items/infra/article.repo';
import { ItemRepo } from '../src/modules/items/infra/item.repo';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.join(HERE, '..');
const DB_FILE = path.join(HERE, 'tmp-kobo-demotion.db');
const DB_URL = `file:${DB_FILE}`;
const MOUNT_BASE = 'https://h/api/v1/kobo/burk_pat_abc123';
const USER = 'userK';

/** Zero-epoch sync token — the device's very first sync. */
const EPOCH_TOKEN = undefined;

function cleanup(): void {
  for (const f of [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`]) {
    if (existsSync(f)) rmSync(f);
  }
}

let prisma: PrismaService;
let items: ItemRepo;
let articles: ArticleRepo;
let syncRepo: KoboSyncRepo;
let syncService: KoboSyncService;

/** A ready-to-sync article: extracted, unarchived, with an Article row. */
async function seedReadyArticle(url: string): Promise<string> {
  const itemId = await items.create({ userId: USER, url, kind: 'article' });
  await articles.upsert(itemId, {
    contentHtml: '<p>Body</p>',
    contentText: 'Body',
    wordCount: 1,
    readingTimeMin: 1,
    coverImageKey: null,
  });
  await items.setExtractStatus(itemId, 'ready');
  return itemId;
}

interface ChangedEntry {
  ChangedEntitlement: { BookEntitlement: { Id: string; IsRemoved: boolean } };
}

function isChangedEntry(entry: unknown): entry is ChangedEntry {
  return typeof entry === 'object' && entry !== null && 'ChangedEntitlement' in entry;
}

beforeAll(async () => {
  cleanup();

  execSync('./node_modules/.bin/prisma migrate deploy', {
    cwd: BACKEND_DIR,
    env: { ...process.env, DATABASE_URL: DB_URL },
    stdio: 'pipe',
  });

  prisma = new PrismaService({ databaseUrl: DB_URL } as never);
  await prisma.onModuleInit();

  items = new ItemRepo(prisma);
  articles = new ArticleRepo(prisma);
  syncRepo = new KoboSyncRepo(prisma);
  // EpubCache only reads config.dataDir; nothing is written in these tests.
  syncService = new KoboSyncService(
    syncRepo,
    new EpubCache({ dataDir: tmpdir() } as unknown as AppConfig),
  );
}, 60_000);

afterAll(async () => {
  if (prisma) await prisma.onModuleDestroy();
  cleanup();
});

describe('demoting a synced article to a bookmark', () => {
  it('retracts it from the device: one removal, no ChangedEntitlement, entitlement purged', async () => {
    const itemId = await seedReadyArticle('https://example.com/demote-me');

    // Sync #1: the article is entitled and lands on the device.
    const first = await syncService.sync(USER, EPOCH_TOKEN, MOUNT_BASE);
    expect(first.body).toHaveLength(1);
    expect(first.body[0]).toHaveProperty('NewEntitlement');
    const uuid = await prisma.koboEntitlement
      .findFirstOrThrow({ where: { itemId } })
      .then((row) => row.uuid);

    // Demote. Prisma's @updatedAt bumps Item.updatedAt, which is exactly what
    // makes the stale ChangedEntitlement fire today.
    expect(await items.update(USER, itemId, { kind: 'bookmark' })).toBe(true);

    // Sync #2: the device must be told the book is gone — and told nothing else.
    const second = await syncService.sync(USER, first.syncToken, MOUNT_BASE);

    const entries = second.body.filter(isChangedEntry);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.ChangedEntitlement.BookEntitlement.Id).toBe(uuid);
    expect(entries[0]?.ChangedEntitlement.BookEntitlement.IsRemoved).toBe(true);
    // No NewEntitlement for a bookmark, ever.
    expect(second.body.some((entry) => Object.hasOwn(entry as object, 'NewEntitlement'))).toBe(
      false,
    );

    // Purged, so a later re-promotion is re-entitled cleanly by findUnsyncedReadyItems.
    expect(await prisma.koboEntitlement.findFirst({ where: { itemId } })).toBeNull();
  });

  it('re-entitles the item when it is promoted back to an article', async () => {
    const itemId = await seedReadyArticle('https://example.com/round-trip');

    const first = await syncService.sync(USER, EPOCH_TOKEN, MOUNT_BASE);
    await items.update(USER, itemId, { kind: 'bookmark' });
    const second = await syncService.sync(USER, first.syncToken, MOUNT_BASE);

    // Promote back — the entitlement was purged, so this is a fresh NewEntitlement.
    await items.update(USER, itemId, { kind: 'article' });
    const third = await syncService.sync(USER, second.syncToken, MOUNT_BASE);

    const newEntries = third.body.filter((entry) =>
      Object.hasOwn(entry as object, 'NewEntitlement'),
    );
    expect(newEntries).toHaveLength(1);
    expect(await prisma.koboEntitlement.findFirst({ where: { itemId } })).not.toBeNull();
  });
});

describe('KoboSyncRepo kind guards', () => {
  it('findChangedItems excludes a demoted item (no stale ChangedEntitlement)', async () => {
    const itemId = await seedReadyArticle('https://example.com/changed-items');
    await syncRepo.createEntitlement(USER, itemId);

    const before = await syncRepo.findChangedItems(USER, '1970-01-01T00:00:00.000Z');
    expect(before.map((row) => row.itemId)).toContain(itemId); // control: article is emitted

    await items.update(USER, itemId, { kind: 'bookmark' });

    const after = await syncRepo.findChangedItems(USER, '1970-01-01T00:00:00.000Z');
    expect(after.map((row) => row.itemId)).not.toContain(itemId);
  });

  it('findOrphanedEntitlements returns entitlements of demoted items as well as deleted ones', async () => {
    const demotedId = await seedReadyArticle('https://example.com/orphan-demoted');
    const demotedUuid = await syncRepo.createEntitlement(USER, demotedId);
    const deletedId = await seedReadyArticle('https://example.com/orphan-deleted');
    const deletedUuid = await syncRepo.createEntitlement(USER, deletedId);
    const keptId = await seedReadyArticle('https://example.com/orphan-kept');
    const keptUuid = await syncRepo.createEntitlement(USER, keptId);

    await items.update(USER, demotedId, { kind: 'bookmark' });
    await items.delete(USER, deletedId); // itemId goes SET NULL

    const uuids = (await syncRepo.findOrphanedEntitlements(USER)).map((row) => row.uuid);
    expect(uuids).toContain(demotedUuid);
    expect(uuids).toContain(deletedUuid); // pre-existing meaning still holds
    expect(uuids).not.toContain(keptUuid); // a live article is not an orphan
  });

  it('findEntitlementByUuid stops serving a demoted item (metadata/state/cover/download)', async () => {
    const itemId = await seedReadyArticle('https://example.com/by-uuid');
    const uuid = await syncRepo.createEntitlement(USER, itemId);

    expect(await syncRepo.findEntitlementByUuid(USER, uuid)).not.toBeNull(); // control

    await items.update(USER, itemId, { kind: 'bookmark' });

    expect(await syncRepo.findEntitlementByUuid(USER, uuid)).toBeNull();
  });
});
