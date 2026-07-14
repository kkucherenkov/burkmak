import { Injectable } from '@nestjs/common';
import type { Item } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import type {
  ExtractStatus,
  IItemRepo,
  ItemDetail,
  ItemKind,
  ItemMetadataPatch,
  ListItemsFilter,
} from '../domain/items.ports';

function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}

function toDetail(row: Item & { tags?: { tag: { slug: string } }[] }): ItemDetail {
  return {
    id: row.id,
    url: row.url,
    kind: row.kind as ItemDetail['kind'],
    canonicalUrl: row.canonicalUrl,
    title: row.title,
    siteName: row.siteName,
    excerpt: row.excerpt,
    leadImageUrl: row.leadImageUrl,
    faviconUrl: row.faviconUrl,
    status: row.status as ItemDetail['status'],
    extractStatus: row.extractStatus as ItemDetail['extractStatus'],
    readState: row.readState as ItemDetail['readState'],
    favorite: row.favorite,
    savedAt: row.savedAt.toISOString(),
    readAt: row.readAt ? row.readAt.toISOString() : null,
    tags: (row.tags ?? []).map((t) => t.tag.slug),
  };
}

/**
 * Escape a user-supplied query string for FTS5 MATCH expression.
 *
 * Strategy: split into whitespace-delimited tokens, wrap each in double-quotes
 * (escaping internal double-quotes by doubling), then append `*` for prefix
 * matching. Tokens that become empty after trimming are dropped.
 *
 * This prevents arbitrary FTS5 syntax (operators like NOT/AND/OR, column
 * filters, NEAR expressions) from being injected by the user.
 *
 * @example
 *   escapeFtsQuery('hello world')  → '"hello"* "world"*'
 *   escapeFtsQuery('say "hi"')     → '"say"* "\"hi\""*'
 */
export function escapeFtsQuery(raw: string): string {
  return raw
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => `"${token.replaceAll('"', '""')}"*`)
    .join(' ');
}

/**
 * Build the Prisma `where` for item queries, shared by the plain and FTS paths.
 * A missing `kind` means "all kinds" — the list endpoint stays backward-compatible.
 */
export function buildItemWhere(f: ListItemsFilter): Record<string, unknown> {
  const where: Record<string, unknown> = { userId: f.userId };
  if (f.readState) where['readState'] = f.readState;
  if (f.favorite !== undefined) where['favorite'] = f.favorite;
  if (f.tag) where['tags'] = { some: { tag: { slug: f.tag, userId: f.userId } } };
  if (f.kind) where['kind'] = f.kind;
  return where;
}

@Injectable()
export class ItemRepo implements IItemRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { userId: string; url: string; kind?: ItemKind }): Promise<string> {
    const item = await this.prisma.item.create({
      data: {
        userId: input.userId,
        url: input.url,
        ...(input.kind !== undefined && { kind: input.kind }),
      },
    });
    return item.id;
  }

  async findById(userId: string, id: string): Promise<ItemDetail | null> {
    const row = await this.prisma.item.findFirst({
      where: { id, userId },
      include: { tags: { include: { tag: true } } },
    });
    return row ? toDetail(row) : null;
  }

  async findMany(f: ListItemsFilter): Promise<{ items: ItemDetail[]; nextCursor: string | null }> {
    if (f.q) {
      return this.findManyFts(f, f.q);
    }
    return this.findManyPlain(f);
  }

  /**
   * Plain findMany (no FTS) — unchanged from S1.
   */
  private async findManyPlain(
    f: ListItemsFilter,
  ): Promise<{ items: ItemDetail[]; nextCursor: string | null }> {
    const where = buildItemWhere(f);

    const rows = await this.prisma.item.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      orderBy: { savedAt: 'desc' },
      take: f.limit + 1,
      ...(f.cursor ? { cursor: { id: f.cursor }, skip: 1 } : {}),
    });
    const hasMore = rows.length > f.limit;
    const page = hasMore ? rows.slice(0, f.limit) : rows;
    const lastItem = page.at(-1);
    return {
      items: page.map((r) => toDetail(r)),
      nextCursor: hasMore && lastItem ? lastItem.id : null,
    };
  }

  /**
   * FTS-backed findMany — branches when filter.q is set.
   *
   * 1. Query item_fts with escaped MATCH expression (ORDER BY rank = best first).
   * 2. Load matching items via Prisma applying userId + readState/tag/favorite.
   * 3. Apply cursor pagination in-rank-order (cursor = last seen item_id).
   */
  private async findManyFts(
    f: ListItemsFilter,
    q: string,
  ): Promise<{ items: ItemDetail[]; nextCursor: string | null }> {
    const ftsQuery = escapeFtsQuery(q);
    if (!ftsQuery) {
      // Empty after escaping (e.g. input was all whitespace) — fall back to plain
      const { q: _q, ...fWithoutQ } = f;
      return this.findManyPlain(fWithoutQ);
    }

    // Raw FTS5 query — parameterised via Prisma template literal (safe from SQL injection).
    // item_fts is a virtual table; ORDER BY rank sorts by relevance (lower = better match).
    const ftsRows = await this.prisma.$queryRaw<{ item_id: string }[]>`
      SELECT item_id FROM item_fts
      WHERE item_fts MATCH ${ftsQuery}
      ORDER BY rank
    `;

    const rankedIds = ftsRows.map((r) => r.item_id);
    if (rankedIds.length === 0) {
      return { items: [], nextCursor: null };
    }

    // Apply cursor: find cursor position in the FTS rank order, skip past it
    let startIndex = 0;
    if (f.cursor) {
      const cursorPos = rankedIds.indexOf(f.cursor);
      startIndex = cursorPos === -1 ? 0 : cursorPos + 1;
    }
    const candidateIds = rankedIds.slice(startIndex, startIndex + f.limit + 1);

    if (candidateIds.length === 0) {
      return { items: [], nextCursor: null };
    }

    // Build additional filters (userId is mandatory for ownership)
    const where = { ...buildItemWhere(f), id: { in: candidateIds } };

    const rows = await this.prisma.item.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      // Preserve FTS rank order — re-sort by position in candidateIds
      // (Prisma doesn't support ORDER BY FIELD; sort in JS after fetch)
    });

    // Re-sort to honour FTS rank (the DB may return rows in any order for IN clause)
    const idOrder = new Map(candidateIds.map((id, i) => [id, i]));
    rows.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

    const hasMore = rows.length > f.limit;
    const page = hasMore ? rows.slice(0, f.limit) : rows;
    const lastItem = page.at(-1);

    return {
      items: page.map((r) => toDetail(r)),
      nextCursor: hasMore && lastItem ? lastItem.id : null,
    };
  }

  async update(
    userId: string,
    id: string,
    patch: { readState?: 'unread' | 'read' | 'archived'; favorite?: boolean; kind?: ItemKind },
  ): Promise<boolean> {
    const data: Record<string, unknown> = { ...patch };
    if (patch.readState === 'read') data['readAt'] = new Date();
    const res = await this.prisma.item.updateMany({ where: { id, userId }, data });
    return res.count > 0;
  }

  async applyMetadata(itemId: string, patch: ItemMetadataPatch): Promise<void> {
    await this.prisma.item.update({ where: { id: itemId }, data: { ...patch } });
  }

  async setExtractStatus(itemId: string, status: ExtractStatus): Promise<void> {
    await this.prisma.item.update({ where: { id: itemId }, data: { extractStatus: status } });
  }

  async applyExtractStatus(
    userId: string,
    itemId: string,
    status: ExtractStatus,
  ): Promise<boolean> {
    const res = await this.prisma.item.updateMany({
      where: { id: itemId, userId },
      data: { extractStatus: status },
    });
    return res.count > 0;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const res = await this.prisma.item.deleteMany({ where: { id, userId } });
    return res.count > 0;
  }

  async addTag(userId: string, itemId: string, name: string): Promise<boolean> {
    const owned = await this.prisma.item.findFirst({
      where: { id: itemId, userId },
      select: { id: true },
    });
    if (!owned) return false;
    const slug = toSlug(name);
    const tag = await this.prisma.tag.upsert({
      where: { userId_slug: { userId, slug } },
      create: { userId, name: name.trim(), slug },
      update: {},
    });
    await this.prisma.itemTag.upsert({
      where: { itemId_tagId: { itemId, tagId: tag.id } },
      create: { itemId, tagId: tag.id },
      update: {},
    });
    return true;
  }

  async removeTag(userId: string, itemId: string, tagSlug: string): Promise<boolean> {
    const owned = await this.prisma.item.findFirst({
      where: { id: itemId, userId },
      select: { id: true },
    });
    if (!owned) return false;
    const tag = await this.prisma.tag.findUnique({
      where: { userId_slug: { userId, slug: tagSlug } },
    });
    if (!tag) return false;
    await this.prisma.itemTag.deleteMany({ where: { itemId, tagId: tag.id } });
    return true;
  }
}
