export const PAT_REPO = Symbol('PAT_REPO');

export interface PatRecord {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface PatRepo {
  create(input: {
    userId: string;
    name: string;
    tokenHash: string;
    prefix: string;
  }): Promise<PatRecord>;
  listForUser(userId: string): Promise<PatRecord[]>;
  revoke(userId: string, id: string): Promise<boolean>; // false if not found/owned
  findActiveByHash(tokenHash: string): Promise<{ id: string; userId: string } | null>;
  touch(id: string): Promise<void>; // set lastUsedAt = now, best-effort
}
