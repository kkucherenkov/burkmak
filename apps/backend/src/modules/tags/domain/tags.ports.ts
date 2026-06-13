export const TAG_REPO = Symbol('TAG_REPO');

export interface TagSummary {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface ITagRepo {
  listForUser(userId: string): Promise<TagSummary[]>;
  rename(userId: string, id: string, name: string): Promise<boolean>;
  remove(userId: string, id: string): Promise<boolean>;
}
