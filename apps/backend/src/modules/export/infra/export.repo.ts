import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import type {
  ExportHighlight,
  ExportItem,
  ExportListFilter,
  IExportRepo,
} from '../domain/export.ports';

interface HighlightRow {
  quote: string;
  note: string | null;
  color: string;
}

interface ItemWithHighlights {
  id: string;
  title: string | null;
  url: string;
  canonicalUrl: string | null;
  siteName: string | null;
  savedAt: Date;
  tags: { tag: { slug: string } }[];
  article: { readingTimeMin: number } | null;
  highlights: HighlightRow[];
}

function toExportItem(row: ItemWithHighlights): ExportItem {
  const highlights: ExportHighlight[] = row.highlights.map((h) => ({
    quote: h.quote,
    note: h.note,
    color: h.color,
  }));

  return {
    id: row.id,
    title: row.title,
    url: row.url,
    canonicalUrl: row.canonicalUrl,
    siteName: row.siteName,
    savedAt: row.savedAt.toISOString(),
    tags: row.tags.map((t) => t.tag.slug),
    readingTimeMin: row.article?.readingTimeMin ?? null,
    highlights,
  };
}

@Injectable()
export class ExportRepo implements IExportRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findItemsWithHighlights(filter: ExportListFilter): Promise<ExportItem[]> {
    const where: Record<string, unknown> = { userId: filter.userId };
    if (filter.readState) where['readState'] = filter.readState;
    if (filter.since) where['savedAt'] = { gte: filter.since };

    const rows = await this.prisma.item.findMany({
      where,
      orderBy: { savedAt: 'desc' },
      select: {
        id: true,
        title: true,
        url: true,
        canonicalUrl: true,
        siteName: true,
        savedAt: true,
        tags: { select: { tag: { select: { slug: true } } } },
        article: { select: { readingTimeMin: true } },
        highlights: {
          where: { userId: filter.userId },
          orderBy: { createdAt: 'asc' },
          select: { quote: true, note: true, color: true },
        },
      },
    });

    return rows.map((r) => toExportItem(r));
  }

  async findItemWithHighlights(userId: string, itemId: string): Promise<ExportItem | null> {
    const row = await this.prisma.item.findFirst({
      where: { id: itemId, userId },
      select: {
        id: true,
        title: true,
        url: true,
        canonicalUrl: true,
        siteName: true,
        savedAt: true,
        tags: { select: { tag: { select: { slug: true } } } },
        article: { select: { readingTimeMin: true } },
        highlights: {
          where: { userId },
          orderBy: { createdAt: 'asc' },
          select: { quote: true, note: true, color: true },
        },
      },
    });

    return row ? toExportItem(row) : null;
  }
}
