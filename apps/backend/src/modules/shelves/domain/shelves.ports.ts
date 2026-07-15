export const SHELF_REPO = Symbol('SHELF_REPO');

export interface ShelfSummary {
  id: string;
  name: string;
}

export interface ShelfDetail extends ShelfSummary {
  itemCount: number;
  createdAt: string;
  lastModified: string;
}

export interface IShelfRepo {
  /** @throws ShelfNameConflictError when the user already has a shelf with this name. */
  create(userId: string, name: string): Promise<string>;
  findById(userId: string, id: string): Promise<ShelfDetail | null>;
  findMany(userId: string): Promise<ShelfDetail[]>;
  /**
   * @returns false when the shelf does not exist or is not owned by this user.
   * @throws ShelfNameConflictError when the new name collides.
   */
  rename(userId: string, id: string, name: string): Promise<boolean>;
  /** @returns false when the shelf does not exist or is not owned by this user. */
  delete(userId: string, id: string): Promise<boolean>;
  /** Idempotent. @returns false when the shelf or item is not found/owned. */
  addItem(userId: string, shelfId: string, itemId: string): Promise<boolean>;
  /** @returns false when the shelf or item is not found/owned. */
  removeItem(userId: string, shelfId: string, itemId: string): Promise<boolean>;
}
