import { Global, Module } from '@nestjs/common';

import { JobWorker } from './job-worker';
import { JobsService } from './jobs.service';

@Global()
@Module({
  providers: [JobsService, JobWorker],
  exports: [JobsService, JobWorker],
})
export class JobsModule {}
