import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import type { ITagRepo, TagSummary } from '../domain/tags.ports';

function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}

@Injectable()
export class TagRepo implements ITagRepo {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<TagSummary[]> {
    const tags = await this.prisma.tag.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      orderBy: { name: 'asc' },
    });
    return tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.items }));
  }

  async rename(userId: string, id: string, name: string): Promise<boolean> {
    const res = await this.prisma.tag.updateMany({
      where: { id, userId },
      data: { name: name.trim(), slug: toSlug(name) },
    });
    return res.count > 0;
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const res = await this.prisma.tag.deleteMany({ where: { id, userId } });
    return res.count > 0;
  }
}
