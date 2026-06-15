import { Module } from '@nestjs/common';

import { ItemsModule } from '../items/items.module';
import { BuildEpubService } from './application/build-epub.service';
import { EpubCache } from './infra/epub.cache';
import { KoboController } from './kobo.controller';

@Module({
  imports: [ItemsModule],
  controllers: [KoboController],
  providers: [EpubCache, BuildEpubService],
})
export class KoboModule {}
