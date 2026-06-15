import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EXPORT_REPO, type IExportRepo } from '../../domain/export.ports';
import { renderNote } from '../../infra/render-note';
import { ExportMarkdownQuery } from './export-markdown.query';

export interface ExportedNote {
  itemId: string;
  title: string;
  filename: string;
  markdown: string;
}

@QueryHandler(ExportMarkdownQuery)
export class ExportMarkdownHandler implements IQueryHandler<ExportMarkdownQuery, { notes: ExportedNote[] }> {
  constructor(@Inject(EXPORT_REPO) private readonly repo: IExportRepo) {}

  async execute(q: ExportMarkdownQuery): Promise<{ notes: ExportedNote[] }> {
    const since = q.filter.since ? new Date(q.filter.since) : undefined;
    const items = await this.repo.findItemsWithHighlights({
      userId: q.userId,
      ...(q.filter.readState !== undefined ? { readState: q.filter.readState } : {}),
      ...(since !== undefined ? { since } : {}),
    });

    const notes: ExportedNote[] = [];
    for (const item of items) {
      if (!q.filter.includeEmpty && item.highlights.length === 0) {
        continue;
      }
      const rendered = renderNote(item, item.highlights);
      notes.push({
        itemId: rendered.itemId,
        title: rendered.title,
        filename: rendered.filename,
        markdown: rendered.markdown,
      });
    }

    return { notes };
  }
}
