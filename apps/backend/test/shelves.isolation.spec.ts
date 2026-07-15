import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

import { afterAll, beforeAll, describe, it, expect } from 'vitest';

import { PrismaService } from '../src/common/prisma/prisma.service';
import { ItemRepo } from '../src/modules/items/infra/item.repo';
import { ShelfNameConflictError } from '../src/modules/shelves/domain/shelves.errors';
import { ShelfRepo } from '../src/modules/shelves/infra/shelf.repo';

const HERE = __dirname;
const BACKEND_DIR = path.resolve(HERE, '..');
const DB_FILE = path.join(HERE, 'tmp-shelves-isolation.db');
const DB_URL = `file:${DB_FILE}`;

function cleanup(): void {
  for (const f of [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`]) {
    if (existsSync(f)) rmSync(f);
  }
}

let prisma: PrismaService;
let shelves: ShelfRepo;
let items: ItemRepo;
let aItemId: string;
let bItemId: string;

beforeAll(async () => {
  cleanup();

  // Apply committed migrations to a throw-away SQLite file (migrations-only
  // policy: no `prisma db push`), so these tests run against the shipping schema.
  execSync('./node_modules/.bin/prisma migrate deploy', {
    cwd: BACKEND_DIR,
    env: { ...process.env, DATABASE_URL: DB_URL },
    stdio: 'pipe',
  });

  prisma = new PrismaService({ databaseUrl: DB_URL } as never);
  await prisma.onModuleInit();
  shelves = new ShelfRepo(prisma);
  items = new ItemRepo(prisma);

  aItemId = await items.create({ userId: 'userA', url: 'https://a.example.com/one' });
  bItemId = await items.create({ userId: 'userB', url: 'https://b.example.com/one' });
}, 60_000);

afterAll(async () => {
  await prisma.$disconnect();
  cleanup();
});

describe('ShelfRepo', () => {
  it('creates a shelf and lists it with a zero count', async () => {
    const id = await shelves.create('userA', 'Reading');
    const list = await shelves.findMany('userA');
    expect(list.map((s) => s.name)).toContain('Reading');
    expect(list.find((s) => s.id === id)?.itemCount).toBe(0);
  });

  it('rejects a duplicate name for the same user', async () => {
    await shelves.create('userA', 'Dupe');
    await expect(shelves.create('userA', 'Dupe')).rejects.toBeInstanceOf(ShelfNameConflictError);
  });

  it('allows the same name for a different user', async () => {
    await shelves.create('userA', 'Shared');
    await expect(shelves.create('userB', 'Shared')).resolves.toBeTruthy();
  });

  it('counts members', async () => {
    const id = await shelves.create('userA', 'Counted');
    await shelves.addItem('userA', id, aItemId);
    const shelf = await shelves.findById('userA', id);
    expect(shelf?.itemCount).toBe(1);
  });

  it('addItem is idempotent', async () => {
    const id = await shelves.create('userA', 'Idempotent');
    expect(await shelves.addItem('userA', id, aItemId)).toBe(true);
    expect(await shelves.addItem('userA', id, aItemId)).toBe(true);
    expect((await shelves.findById('userA', id))?.itemCount).toBe(1);
  });

  it('bumps lastModified on a membership change', async () => {
    const id = await shelves.create('userA', 'Touched');
    const before = (await shelves.findById('userA', id))!.lastModified;
    await new Promise((r) => setTimeout(r, 1100)); // SQLite DATETIME is second-resolution
    await shelves.addItem('userA', id, aItemId);
    const after = (await shelves.findById('userA', id))!.lastModified;
    expect(new Date(after).getTime()).toBeGreaterThan(new Date(before).getTime());
  });

  it("will not add another user's item", async () => {
    const id = await shelves.create('userA', 'Foreign');
    expect(await shelves.addItem('userA', id, bItemId)).toBe(false);
    expect((await shelves.findById('userA', id))?.itemCount).toBe(0);
  });

  it("will not touch another user's shelf", async () => {
    const id = await shelves.create('userA', 'Private');
    expect(await shelves.rename('userB', id, 'Hijacked')).toBe(false);
    expect(await shelves.delete('userB', id)).toBe(false);
    expect(await shelves.findById('userB', id)).toBeNull();
    expect((await shelves.findById('userA', id))?.name).toBe('Private');
  });

  it('rename rejects a colliding name', async () => {
    await shelves.create('userA', 'Taken');
    const id = await shelves.create('userA', 'Renameable');
    await expect(shelves.rename('userA', id, 'Taken')).rejects.toBeInstanceOf(
      ShelfNameConflictError,
    );
  });

  it('deleting a shelf cascades its memberships', async () => {
    const id = await shelves.create('userA', 'Doomed');
    await shelves.addItem('userA', id, aItemId);
    expect(await shelves.delete('userA', id)).toBe(true);
    expect(await prisma.shelfItem.count({ where: { shelfId: id } })).toBe(0);
  });

  it('deleting an item removes it from shelves', async () => {
    const id = await shelves.create('userA', 'Survivor');
    const doomedItem = await items.create({ userId: 'userA', url: 'https://a.example.com/gone' });
    await shelves.addItem('userA', id, doomedItem);
    await items.delete('userA', doomedItem);
    expect((await shelves.findById('userA', id))?.itemCount).toBe(0);
  });
});
