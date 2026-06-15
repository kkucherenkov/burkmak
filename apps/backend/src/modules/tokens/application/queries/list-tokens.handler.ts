import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PAT_REPO, type PatRepo, type PatRecord } from '../../domain/tokens.ports';
import { ListTokensQuery } from './list-tokens.query';

@QueryHandler(ListTokensQuery)
export class ListTokensHandler implements IQueryHandler<ListTokensQuery, { tokens: PatRecord[] }> {
  constructor(@Inject(PAT_REPO) private readonly repo: PatRepo) {}

  async execute(q: ListTokensQuery): Promise<{ tokens: PatRecord[] }> {
    return { tokens: await this.repo.listForUser(q.userId) };
  }
}
