import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { ItemNotFoundError } from '../../items/domain/items.errors';
import { HighlightNotFoundError } from '../domain/highlights.errors';
import type {
  CreateHighlightInput,
  HighlightDetail,
  IHighlightRepo,
  UpdateHighlightInput,
} from '../domain/highlights.ports';

function toDetail(row: {
  id: string;
  itemId: string;
  quote: string;
  prefix: string;
  suffix: string;
  note: string | null;
  color: string;
  createdAt: Date;
}): HighlightDetail {
  return {
    id: row.id,
    itemId: row.itemId,
    quote: row.quote,
    prefix: row.prefix,
    suffix: row.suffix,
    note: row.note,
    color: row.color,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class HighlightRepo implements IHighlightRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    itemId: string,
    input: CreateHighlightInput,
  ): Promise<HighlightDetail> {
    const owned = await this.prisma.item.findFirst({
      where: { id: itemId, userId },
      select: { id: true },
    });
    if (!owned) throw new ItemNotFoundError(itemId);

    const row = await this.prisma.highlight.create({
      data: {
        userId,
        itemId,
        quote: input.quote,
        prefix: input.prefix ?? '',
        suffix: input.suffix ?? '',
        note: input.note ?? null,
        color: input.color ?? 'yellow',
      },
    });
    return toDetail(row);
  }

  async listForItem(userId: string, itemId: string): Promise<HighlightDetail[]> {
    const owned = await this.prisma.item.findFirst({
      where: { id: itemId, userId },
      select: { id: true },
    });
    if (!owned) throw new ItemNotFoundError(itemId);

    const rows = await this.prisma.highlight.findMany({
      where: { itemId, userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => toDetail(r));
  }

  async update(userId: string, id: string, input: UpdateHighlightInput): Promise<HighlightDetail> {
    const data: Record<string, unknown> = {};
    if ('note' in input) data['note'] = input.note ?? null;
    if (input.color !== undefined) data['color'] = input.color;

    const res = await this.prisma.highlight.updateMany({
      where: { id, userId },
      data,
    });
    if (res.count === 0) throw new HighlightNotFoundError(id);

    const row = await this.prisma.highlight.findFirst({ where: { id, userId } });
    if (!row) throw new HighlightNotFoundError(id);
    return toDetail(row);
  }

  async remove(userId: string, id: string): Promise<void> {
    const res = await this.prisma.highlight.deleteMany({ where: { id, userId } });
    if (res.count === 0) throw new HighlightNotFoundError(id);
  }
}
