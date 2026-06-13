import { Global, Module } from '@nestjs/common';

import { DataLoaderFactory } from './dataloader.factory';
import { DATA_LOADER_FACTORY } from './dataloader.types';

@Global()
@Module({
  providers: [
    {
      provide: DATA_LOADER_FACTORY,
      useClass: DataLoaderFactory,
    },
  ],
  exports: [DATA_LOADER_FACTORY],
})
export class DataLoaderModule {}
