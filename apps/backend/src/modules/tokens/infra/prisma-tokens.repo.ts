import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import type { PatRecord, PatRepo } from '../domain/tokens.ports';

function toRecord(row: {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}): PatRecord {
  return {
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    lastUsedAt: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class PrismaTokensRepo implements PatRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    userId: string;
    name: string;
    tokenHash: string;
    prefix: string;
  }): Promise<PatRecord> {
    const row = await this.prisma.personalAccessToken.create({
      data: {
        userId: input.userId,
        name: input.name,
        tokenHash: input.tokenHash,
        prefix: input.prefix,
      },
      select: { id: true, name: true, prefix: true, lastUsedAt: true, createdAt: true },
    });
    return toRecord(row);
  }

  async listForUser(userId: string): Promise<PatRecord[]> {
    const rows = await this.prisma.personalAccessToken.findMany({
      where: { userId, revokedAt: null },
      select: { id: true, name: true, prefix: true, lastUsedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => toRecord(r));
  }

  async revoke(userId: string, id: string): Promise<boolean> {
    const result = await this.prisma.personalAccessToken.updateMany({
      where: { id, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count > 0;
  }

  async findActiveByHash(tokenHash: string): Promise<{ id: string; userId: string } | null> {
    const now = new Date();
    const row = await this.prisma.personalAccessToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { id: true, userId: true },
    });
    return row ?? null;
  }

  async touch(id: string): Promise<void> {
    await this.prisma.personalAccessToken.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }
}
