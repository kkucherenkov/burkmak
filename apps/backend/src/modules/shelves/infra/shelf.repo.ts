import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { ShelfNameConflictError } from '../domain/shelves.errors';
import type { IShelfRepo, ShelfDetail } from '../domain/shelves.ports';

/** Prisma's unique-constraint violation. */
const UNIQUE_VIOLATION = 'P2002';

interface ShelfRow {
  id: string;
  name: string;
  createdAt: Date;
  lastModified: Date;
  _count: { items: number };
}

function toDetail(row: ShelfRow): ShelfDetail {
  return {
    id: row.id,
    name: row.name,
    itemCount: row._count.items,
    createdAt: row.createdAt.toISOString(),
    lastModified: row.lastModified.toISOString(),
  };
}

@Injectable()
export class ShelfRepo implements IShelfRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, name: string): Promise<string> {
    const row = await this.withNameConflictGuard(name, () =>
      this.prisma.shelf.create({ data: { userId, name } }),
    );
    return row.id;
  }

  async findById(userId: string, id: string): Promise<ShelfDetail | null> {
    const row = await this.prisma.shelf.findFirst({
      where: { id, userId },
      include: { _count: { select: { items: true } } },
    });
    return row ? toDetail(row) : null;
  }

  async findMany(userId: string): Promise<ShelfDetail[]> {
    const rows = await this.prisma.shelf.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => toDetail(row));
  }

  async rename(userId: string, id: string, name: string): Promise<boolean> {
    const { count } = await this.withNameConflictGuard(name, () =>
      this.prisma.shelf.updateMany({ where: { id, userId }, data: { name } }),
    );
    return count > 0;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const { count } = await this.prisma.shelf.deleteMany({ where: { id, userId } });
    return count > 0;
  }

  async addItem(userId: string, shelfId: string, itemId: string): Promise<boolean> {
    if (!(await this.ownsBoth(userId, shelfId, itemId))) return false;
    // Idempotent: repeating the call must not error or duplicate. Create
    // rather than upsert so a repeat call is distinguishable from a real
    // change — catching P2002 tells us the row already existed, so we skip
    // the touch below rather than bumping lastModified for a no-op write.
    try {
      await this.prisma.shelfItem.create({ data: { shelfId, itemId } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_VIOLATION
      ) {
        return true;
      }
      throw error;
    }
    await this.touch(shelfId);
    return true;
  }

  async removeItem(userId: string, shelfId: string, itemId: string): Promise<boolean> {
    if (!(await this.ownsBoth(userId, shelfId, itemId))) return false;
    const { count } = await this.prisma.shelfItem.deleteMany({ where: { shelfId, itemId } });
    // Only touch when membership actually changed — deleting a non-member is
    // a no-op and must not advance lastModified (③b drives its device delta
    // off this column; a spurious bump would emit a false ChangedTag).
    if (count > 0) await this.touch(shelfId);
    return true;
  }

  /**
   * Runs a shelf-name-mutating call and remaps Prisma's unique-constraint
   * violation to `ShelfNameConflictError`. Catching rather than pre-checking
   * avoids a SELECT-then-write race between two concurrent callers.
   */
  private async withNameConflictGuard<T>(name: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_VIOLATION
      ) {
        throw new ShelfNameConflictError(name);
      }
      throw error;
    }
  }

  /**
   * Both the shelf and the item must belong to this user, and the item must
   * be an article — shelves are article-only (design non-goal: bookmarks are
   * not shelvable in this slice). This is the write-side half of the
   * invariant; `buildItemWhere` (items/infra/item.repo.ts) enforces the read
   * side, because a shelved article demoted to a bookmark never touches this
   * method at all.
   */
  private async ownsBoth(userId: string, shelfId: string, itemId: string): Promise<boolean> {
    const [shelf, item] = await Promise.all([
      this.prisma.shelf.findFirst({ where: { id: shelfId, userId }, select: { id: true } }),
      this.prisma.item.findFirst({
        where: { id: itemId, userId, kind: 'article' },
        select: { id: true },
      }),
    ]);
    return shelf !== null && item !== null;
  }

  /**
   * `@updatedAt` only fires for writes to the shelf row itself, so a membership
   * change leaves lastModified stale. Slice ③b drives the device's ChangedTag
   * delta off this column, so the touch has to be explicit.
   */
  private async touch(shelfId: string): Promise<void> {
    await this.prisma.shelf.update({ where: { id: shelfId }, data: { lastModified: new Date() } });
  }
}
