import { Module, type OnModuleInit } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { JobWorker } from '../../common/jobs/job-worker';
import { AddItemTagHandler } from './application/commands/add-item-tag.handler';
import { DeleteItemHandler } from './application/commands/delete-item.handler';
import { RemoveItemTagHandler } from './application/commands/remove-item-tag.handler';
import { SaveItemHandler } from './application/commands/save-item.handler';
import { UpdateItemHandler } from './application/commands/update-item.handler';
import { GetItemHandler } from './application/queries/get-item.handler';
import { ListItemsHandler } from './application/queries/list-items.handler';
import { ITEM_REPO } from './domain/items.ports';
import { FetchMetadataHandler } from './infra/fetch-metadata.handler';
import { ItemRepo } from './infra/item.repo';
import { HttpMetadataFetcher, METADATA_FETCHER } from './infra/metadata.fetcher';
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
    GetItemHandler,
    ListItemsHandler,
    FetchMetadataHandler,
    { provide: ITEM_REPO, useClass: ItemRepo },
    { provide: METADATA_FETCHER, useClass: HttpMetadataFetcher },
  ],
})
export class ItemsModule implements OnModuleInit {
  constructor(
    private readonly worker: JobWorker,
    private readonly handler: FetchMetadataHandler,
  ) {}

  onModuleInit(): void {
    this.worker.register(this.handler); // wire fetch_metadata into the S0 worker
  }
}
