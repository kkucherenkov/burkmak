import { beforeEach, describe, expect, it } from 'vitest';

import { DataLoaderFactory } from './dataloader.factory';

const stubBatchFn = async (keys: readonly string[]) => keys.map(() => 'v');

describe('DataLoaderFactory', () => {
  let factory: DataLoaderFactory;

  beforeEach(() => {
    factory = new DataLoaderFactory();
  });

  it('creates a DataLoader that batches keys', async () => {
    const batchCalls: string[][] = [];
    const batchFn = async (keys: readonly string[]) => {
      batchCalls.push([...keys]);
      return keys.map((k) => `value:${k}`);
    };

    const loader = factory.get<string, string>('users', batchFn);
    const [a, b] = await Promise.all([loader.load('1'), loader.load('2')]);

    expect(a).toBe('value:1');
    expect(b).toBe('value:2');
    expect(batchCalls).toHaveLength(1);
    expect(batchCalls[0]).toEqual(['1', '2']);
  });

  it('returns the same loader instance for the same key', () => {
    const l1 = factory.get<string, string>('users', stubBatchFn);
    const l2 = factory.get<string, string>('users', stubBatchFn);
    expect(l1).toBe(l2);
  });

  it('returns distinct loaders for different keys', () => {
    const l1 = factory.get<string, string>('users', stubBatchFn);
    const l2 = factory.get<string, string>('providers', stubBatchFn);
    expect(l1).not.toBe(l2);
  });
});
