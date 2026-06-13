import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { type BatchLoadFn, type IDataLoaderFactory } from './dataloader.types';

@Injectable({ scope: Scope.REQUEST })
export class DataLoaderFactory implements IDataLoaderFactory {
  private readonly loaders = new Map<string, DataLoader<unknown, unknown>>();

  get<K, V>(loaderKey: string, batchFn: BatchLoadFn<K, V>): DataLoader<K, V> {
    if (!this.loaders.has(loaderKey)) {
      this.loaders.set(loaderKey, new DataLoader<K, V>(batchFn));
    }
    return this.loaders.get(loaderKey) as DataLoader<K, V>;
  }
}
