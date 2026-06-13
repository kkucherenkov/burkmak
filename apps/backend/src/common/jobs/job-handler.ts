import type { Job } from '@prisma/client';

/** A unit of background work, keyed by Job.type. Implemented in feature modules. */
export interface JobHandler {
  readonly type: string;
  handle(job: Job): Promise<void>;
}

export const JOB_HANDLERS = Symbol('JOB_HANDLERS');
