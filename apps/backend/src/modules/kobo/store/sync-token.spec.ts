import { describe, expect, it } from 'vitest';

import { decodeSyncToken, encodeSyncToken, type SyncToken } from './sync-token';

const EPOCH_TOKEN: SyncToken = {
  booksLastModified: '1970-01-01T00:00:00.000Z',
  readingStateLastModified: '1970-01-01T00:00:00.000Z',
  archiveLastModified: '1970-01-01T00:00:00.000Z',
};

describe('sync-token codec', () => {
  it('round-trips a token through encode → decode', () => {
    const token: SyncToken = {
      booksLastModified: '2026-06-01T00:00:00.000Z',
      readingStateLastModified: '2026-06-02T00:00:00.000Z',
      archiveLastModified: '2026-06-01T00:00:00.000Z',
    };
    expect(decodeSyncToken(encodeSyncToken(token))).toEqual(token);
  });

  it('encodes as base64url (no +, /, or = padding)', () => {
    const encoded = encodeSyncToken(EPOCH_TOKEN);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('defaults to the zero-epoch when the header is absent', () => {
    expect(decodeSyncToken(undefined)).toEqual(EPOCH_TOKEN);
  });

  it('defaults to the zero-epoch for garbage input, never throws', () => {
    expect(() => decodeSyncToken('not-base64-json!!!')).not.toThrow();
    expect(decodeSyncToken('not-base64-json!!!')).toEqual(EPOCH_TOKEN);
  });

  it('defaults to the zero-epoch when decoded JSON is missing required keys', () => {
    const wrongShape = Buffer.from(JSON.stringify({ foo: 'bar' })).toString('base64url');
    expect(decodeSyncToken(wrongShape)).toEqual(EPOCH_TOKEN);
  });

  it('defaults to the zero-epoch when decoded JSON is not an object', () => {
    const notAnObject = Buffer.from(JSON.stringify('hello')).toString('base64url');
    expect(decodeSyncToken(notAnObject)).toEqual(EPOCH_TOKEN);
  });
});
