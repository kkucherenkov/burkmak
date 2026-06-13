import DataLoader from 'dataloader';

export const DATA_LOADER_FACTORY = Symbol('DATA_LOADER_FACTORY');

export type BatchLoadFn<K, V> = (keys: readonly K[]) => Promise<(V | Error)[]>;

export interface IDataLoaderFactory {
  /**
   * Returns a memoized DataLoader for the given key.
   * Calling get() with the same loaderKey multiple times within one request
   * returns the same DataLoader instance — enabling cross-handler batching.
   */
  get<K, V>(loaderKey: string, batchFn: BatchLoadFn<K, V>): DataLoader<K, V>;
}
