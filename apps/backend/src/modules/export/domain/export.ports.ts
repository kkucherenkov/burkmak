import type { ReadState } from '../../items/domain/items.ports';

export const EXPORT_REPO = Symbol('EXPORT_REPO');

export interface ExportHighlight {
  quote: string;
  note: string | null;
  color: string;
}

export interface ExportItem {
  id: string;
  title: string | null;
  url: string;
  canonicalUrl: string | null;
  siteName: string | null;
  savedAt: string;
  tags: string[];
  readingTimeMin: number | null;
  highlights: ExportHighlight[];
}

export interface ExportListFilter {
  userId: string;
  readState?: ReadState;
  since?: Date;
}

export interface IExportRepo {
  /** Load all items (with highlights) for a user, newest first. */
  findItemsWithHighlights(filter: ExportListFilter): Promise<ExportItem[]>;

  /** Load a single item (with highlights) owned by userId; null = not found/not owned. */
  findItemWithHighlights(userId: string, itemId: string): Promise<ExportItem | null>;
}
