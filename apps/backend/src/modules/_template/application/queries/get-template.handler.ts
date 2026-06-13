/**
 * WHY this file exists:
 * Query handlers contain read-side logic. They receive a Query, fetch data
 * through the repo port, and return a typed read model. They never mutate state.
 *
 * Pattern:
 *  1. Call the repo port method shaped for this use case (no over-fetching).
 *  2. If the resource is missing, throw a DomainError subclass — never NotFoundException.
 *  3. Return the read model directly — no mapping in the controller.
 */
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TemplateNotFoundError } from '../../domain/_template.errors';
import { TEMPLATE_REPO } from '../../domain/_template.ports';

import { GetTemplateQuery } from './get-template.query';

import type { ITemplateRepo, TemplateDetail } from '../../domain/_template.ports';

@QueryHandler(GetTemplateQuery)
export class GetTemplateHandler implements IQueryHandler<GetTemplateQuery, TemplateDetail> {
  constructor(@Inject(TEMPLATE_REPO) private readonly repo: ITemplateRepo) {}

  async execute(query: GetTemplateQuery): Promise<TemplateDetail> {
    const template = await this.repo.findById(query.id);
    if (!template) {
      throw new TemplateNotFoundError(query.id);
    }
    return template;
  }
}
