import { Injectable } from '@nestjs/common';
import type { Item } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import type {
  IItemRepo,
  ItemDetail,
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
    canonicalUrl: row.canonicalUrl,
    title: row.title,
    siteName: row.siteName,
    excerpt: row.excerpt,
    leadImageUrl: row.leadImageUrl,
    faviconUrl: row.faviconUrl,
    status: row.status as ItemDetail['status'],
    readState: row.readState as ItemDetail['readState'],
    favorite: row.favorite,
    savedAt: row.savedAt.toISOString(),
    readAt: row.readAt ? row.readAt.toISOString() : null,
    tags: (row.tags ?? []).map((t) => t.tag.slug),
  };
}

@Injectable()
export class ItemRepo implements IItemRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { userId: string; url: string }): Promise<string> {
    const item = await this.prisma.item.create({ data: { userId: input.userId, url: input.url } });
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
    const where: Record<string, unknown> = { userId: f.userId };
    if (f.readState) where['readState'] = f.readState;
    if (f.favorite !== undefined) where['favorite'] = f.favorite;
    if (f.tag) where['tags'] = { some: { tag: { slug: f.tag, userId: f.userId } } };
    if (f.q) where['OR'] = [{ title: { contains: f.q } }, { url: { contains: f.q } }];

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

  async update(
    userId: string,
    id: string,
    patch: { readState?: 'unread' | 'read' | 'archived'; favorite?: boolean },
  ): Promise<boolean> {
    const data: Record<string, unknown> = { ...patch };
    if (patch.readState === 'read') data['readAt'] = new Date();
    const res = await this.prisma.item.updateMany({ where: { id, userId }, data });
    return res.count > 0;
  }

  async applyMetadata(itemId: string, patch: ItemMetadataPatch): Promise<void> {
    await this.prisma.item.update({ where: { id: itemId }, data: { ...patch } });
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
