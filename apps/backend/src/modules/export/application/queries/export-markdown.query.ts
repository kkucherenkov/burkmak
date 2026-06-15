import type { ReadState } from '../../../items/domain/items.ports';

export class ExportMarkdownQuery {
  constructor(
    public readonly userId: string,
    public readonly filter: {
      readState?: ReadState;
      since?: string;
      includeEmpty: boolean;
    },
  ) {}
}
