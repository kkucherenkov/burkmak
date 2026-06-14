export const HIGHLIGHT_REPO = Symbol('HIGHLIGHT_REPO');

export interface HighlightDetail {
  id: string;
  itemId: string;
  quote: string;
  prefix: string;
  suffix: string;
  note: string | null;
  color: string;
  createdAt: string;
}

export interface CreateHighlightInput {
  quote: string;
  prefix?: string;
  suffix?: string;
  note?: string;
  color?: string;
}

export interface UpdateHighlightInput {
  note?: string | null;
  color?: string;
}

export interface IHighlightRepo {
  create(userId: string, itemId: string, input: CreateHighlightInput): Promise<HighlightDetail>;
  listForItem(userId: string, itemId: string): Promise<HighlightDetail[]>;
  update(userId: string, id: string, input: UpdateHighlightInput): Promise<HighlightDetail>;
  remove(userId: string, id: string): Promise<void>;
}
