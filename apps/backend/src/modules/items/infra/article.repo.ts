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
