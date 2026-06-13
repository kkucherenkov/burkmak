import { beforeEach, describe, expect, it } from 'vitest';

import { MockStorageService } from './mock-storage.service';

describe('MockStorageService', () => {
  let svc: MockStorageService;

  beforeEach(() => {
    svc = new MockStorageService();
  });

  it('presign returns an uploadId, uploadUrl and expiresAt', async () => {
    const result = await svc.presign({
      filename: 'avatar.jpg',
      contentType: 'image/jpeg',
      userId: 'user-1',
    });
    expect(result.uploadId).toBeTruthy();
    expect(result.uploadUrl).toContain(result.uploadId);
    expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('complete resolves the upload and returns a publicUrl', async () => {
    const presign = await svc.presign({
      filename: 'doc.pdf',
      contentType: 'application/pdf',
      userId: 'user-1',
    });
    const complete = await svc.complete(presign.uploadId);
    expect(complete.uploadId).toBe(presign.uploadId);
    expect(complete.publicUrl).toContain(presign.uploadId);
  });

  it('complete throws for an unknown uploadId', async () => {
    await expect(svc.complete('nonexistent-id')).rejects.toThrow('Unknown uploadId');
  });
});
