import { Module, type OnModuleInit } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { JobWorker } from '../../common/jobs/job-worker';
import { AddItemTagHandler } from './application/commands/add-item-tag.handler';
import { DeleteItemHandler } from './application/commands/delete-item.handler';
import { ExtractItemHandler } from './application/commands/extract-item.handler';
import { RemoveItemTagHandler } from './application/commands/remove-item-tag.handler';
import { SaveItemHandler } from './application/commands/save-item.handler';
import { UpdateItemHandler } from './application/commands/update-item.handler';
import { GetArticleHandler } from './application/queries/get-article.handler';
import { GetItemHandler } from './application/queries/get-item.handler';
import { ListItemsHandler } from './application/queries/list-items.handler';
import { ARTICLE_EXTRACTOR, ARTICLE_REPO, IMAGE_CACHE } from './domain/article.ports';
import { ITEM_REPO } from './domain/items.ports';
import { ArticleRepo } from './infra/article.repo';
import { ExtractArticleHandler } from './infra/extract-article.handler';
import { FetchMetadataHandler } from './infra/fetch-metadata.handler';
import { LocalImageCache } from './infra/image-cache';
import { ItemRepo } from './infra/item.repo';
import { HttpMetadataFetcher, METADATA_FETCHER } from './infra/metadata.fetcher';
import { ReadabilityExtractor } from './infra/readability.extractor';
import { ItemsController } from './items.controller';

@Module({
  imports: [CqrsModule],
  controllers: [ItemsController],
  providers: [
    SaveItemHandler,
    UpdateItemHandler,
    DeleteItemHandler,
    AddItemTagHandler,
    RemoveItemTagHandler,
    ExtractItemHandler,
    GetItemHandler,
    ListItemsHandler,
    GetArticleHandler,
    FetchMetadataHandler,
    ExtractArticleHandler,
    { provide: ITEM_REPO, useClass: ItemRepo },
    { provide: METADATA_FETCHER, useClass: HttpMetadataFetcher },
    { provide: ARTICLE_REPO, useClass: ArticleRepo },
    { provide: ARTICLE_EXTRACTOR, useClass: ReadabilityExtractor },
    { provide: IMAGE_CACHE, useClass: LocalImageCache },
  ],
})
export class ItemsModule implements OnModuleInit {
  constructor(
    private readonly worker: JobWorker,
    private readonly fetchHandler: FetchMetadataHandler,
    private readonly extractHandler: ExtractArticleHandler,
  ) {}

  onModuleInit(): void {
    this.worker.register(this.fetchHandler); // wire fetch_metadata into the S0 worker
    this.worker.register(this.extractHandler); // wire extract_article into the S2 worker
  }
}
