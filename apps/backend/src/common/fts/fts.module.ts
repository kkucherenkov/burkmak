import { Global, Module } from '@nestjs/common';

import { FtsBootstrapService } from './fts.bootstrap';

@Global()
@Module({
  providers: [FtsBootstrapService],
  exports: [FtsBootstrapService],
})
export class FtsModule {}
