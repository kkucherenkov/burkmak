import { Module } from '@nestjs/common';

import { ItemsModule } from '../items/items.module';
import { BuildEpubService } from './application/build-epub.service';
import { EpubCache } from './infra/epub.cache';
import { KoboController } from './kobo.controller';
import { KoboReadingStateService } from './store/kobo-reading-state.service';
import { KoboStoreController } from './store/kobo-store.controller';
import { KoboSyncRepo } from './store/kobo-sync.repo';
import { KoboSyncService } from './store/kobo-sync.service';
import { KoboTokenGuard } from './store/kobo-token.guard';

// PrismaService (KoboSyncRepo) and PatService (KoboTokenGuard) come from the
// global PrismaModule / AuthModule — no explicit imports needed here.
@Module({
  imports: [ItemsModule],
  controllers: [KoboController, KoboStoreController],
  providers: [
    EpubCache,
    BuildEpubService,
    KoboTokenGuard,
    KoboSyncRepo,
    KoboSyncService,
    KoboReadingStateService,
  ],
})
export class KoboModule {}
