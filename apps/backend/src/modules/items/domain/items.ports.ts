export const ITEM_REPO = Symbol('ITEM_REPO');

export type ItemStatus = 'pending' | 'ready' | 'failed';
export type ReadState = 'unread' | 'read' | 'archived';

export interface ItemDetail {
  id: string;
  url: string;
  canonicalUrl: string | null;
  title: string | null;
  siteName: string | null;
  excerpt: string | null;
  leadImageUrl: string | null;
  faviconUrl: string | null;
  status: ItemStatus;
  readState: ReadState;
  favorite: boolean;
  savedAt: string;
  readAt: string | null;
  tags: string[]; // slugs
}

export interface ItemMetadataPatch {
  title?: string | null;
  siteName?: string | null;
  excerpt?: string | null;
  leadImageUrl?: string | null;
  faviconUrl?: string | null;
  canonicalUrl?: string | null;
  status: ItemStatus;
}

export interface ListItemsFilter {
  userId: string;
  readState?: ReadState;
  tag?: string; // slug
  favorite?: boolean;
  q?: string;
  cursor?: string;
  limit: number;
}

export interface IItemRepo {
  create(input: { userId: string; url: string }): Promise<string>;
  findById(userId: string, id: string): Promise<ItemDetail | null>;
  findMany(filter: ListItemsFilter): Promise<{ items: ItemDetail[]; nextCursor: string | null }>;
  update(
    userId: string,
    id: string,
    patch: { readState?: ReadState; favorite?: boolean },
  ): Promise<boolean>; // false = not found/owned
  applyMetadata(itemId: string, patch: ItemMetadataPatch): Promise<void>;
  delete(userId: string, id: string): Promise<boolean>;
  addTag(userId: string, itemId: string, tag: string): Promise<boolean>;
  removeTag(userId: string, itemId: string, tagSlug: string): Promise<boolean>;
}
