import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ItemNotFoundError } from '../../../items/domain/items.errors';
import { EXPORT_REPO, type IExportRepo } from '../../domain/export.ports';
import { renderNote } from '../../infra/render-note';
import { ExportItemMarkdownQuery } from './export-item-markdown.query';

@QueryHandler(ExportItemMarkdownQuery)
export class ExportItemMarkdownHandler implements IQueryHandler<ExportItemMarkdownQuery, string> {
  constructor(@Inject(EXPORT_REPO) private readonly repo: IExportRepo) {}

  async execute(q: ExportItemMarkdownQuery): Promise<string> {
    const item = await this.repo.findItemWithHighlights(q.userId, q.itemId);
    if (!item) throw new ItemNotFoundError(q.itemId);

    const { markdown } = renderNote(item, item.highlights);
    return markdown;
  }
}
