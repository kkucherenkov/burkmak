import { Injectable } from '@nestjs/common';
import type { Job } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

export interface EnqueueInput {
  userId: string;
  itemId?: string | null;
  payload?: unknown;
}

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(type: string, input: EnqueueInput): Promise<Job> {
    return this.prisma.job.create({
      data: {
        type,
        userId: input.userId,
        itemId: input.itemId ?? null,
        payload: input.payload === undefined ? null : JSON.stringify(input.payload),
        status: 'queued',
      },
    });
  }
}
