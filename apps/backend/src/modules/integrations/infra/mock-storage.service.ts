import fs from 'node:fs';
import path from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';

import type { CompleteUploadResult, IStorageService, PresignResult } from '../domain/storage.port';

/** Presign metadata stored in memory until the upload is completed. */
interface PendingUpload {
  readonly uploadId: string;
  readonly filename: string;
  readonly contentType: string;
  readonly userId: string;
  readonly localPath: string;
}

@Injectable()
export class MockStorageService implements IStorageService {
  private readonly logger = new Logger(MockStorageService.name);
  private readonly storageDir: string;
  private readonly pending = new Map<string, PendingUpload>();

  constructor() {
    // Resolve relative to the backend app root (two levels up from dist/)
    this.storageDir = path.resolve(process.cwd(), '.storage');
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  presign(opts: { filename: string; contentType: string; userId: string }): Promise<PresignResult> {
    const uploadId = nanoid();
    const ext = path.extname(opts.filename);
    const localPath = path.join(this.storageDir, `${uploadId}${ext}`);

    this.pending.set(uploadId, {
      uploadId,
      filename: opts.filename,
      contentType: opts.contentType,
      userId: opts.userId,
      localPath,
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    this.logger.debug(`[MOCK STORAGE] presign uploadId=${uploadId} filename=${opts.filename}`);

    return Promise.resolve({
      uploadId,
      // In dev, the "upload URL" is a local endpoint that writes to .storage/
      uploadUrl: `/api/v1/dev/uploads/${uploadId}`,
      expiresAt,
    });
  }

  complete(uploadId: string): Promise<CompleteUploadResult> {
    const slot = this.pending.get(uploadId);
    if (!slot) {
      return Promise.reject(new Error(`Unknown uploadId: ${uploadId}`));
    }
    this.pending.delete(uploadId);

    const publicUrl = `/api/v1/dev/uploads/${uploadId}/file`;
    this.logger.debug(`[MOCK STORAGE] complete uploadId=${uploadId} -> ${publicUrl}`);

    return Promise.resolve({ uploadId, publicUrl });
  }
}
