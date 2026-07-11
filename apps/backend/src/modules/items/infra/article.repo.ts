import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import type { ArticleUpsertData, IArticleRepo, ItemArticle } from '../domain/article.ports';

@Injectable()
export class ArticleRepo implements IArticleRepo {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(itemId: string, data: ArticleUpsertData): Promise<void> {
    await this.prisma.article.upsert({
      where: { itemId },
      create: { itemId, ...data },
      update: { ...data, extractedAt: new Date() },
    });
  }

  async findCoverKeys(userId: string, itemIds: string[]): Promise<Map<string, string>> {
    if (itemIds.length === 0) return new Map();

    const rows = await this.prisma.article.findMany({
      where: {
        itemId: { in: itemIds },
        coverImageKey: { not: null },
        item: { userId }, // ownership: join item and enforce userId
      },
      select: { itemId: true, coverImageKey: true },
    });

    const map = new Map<string, string>();
    for (const row of rows) {
      if (row.coverImageKey !== null) map.set(row.itemId, row.coverImageKey);
    }
    return map;
  }

  async findByItem(userId: string, itemId: string): Promise<ItemArticle | null> {
    const article = await this.prisma.article.findFirst({
      where: {
        itemId,
        item: { userId }, // ownership: join item and enforce userId
      },
      select: {
        itemId: true,
        contentHtml: true,
        contentText: true,
        wordCount: true,
        readingTimeMin: true,
        extractedAt: true,
      },
    });

    if (!article) return null;

    return {
      itemId: article.itemId,
      contentHtml: article.contentHtml,
      contentText: article.contentText,
      wordCount: article.wordCount,
      readingTimeMin: article.readingTimeMin,
      extractedAt: article.extractedAt.toISOString(),
    };
  }
}
