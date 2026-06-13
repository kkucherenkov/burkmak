export const STORAGE_PORT = Symbol('StoragePort');

export interface PresignResult {
  readonly uploadId: string;
  /** The URL the client should PUT the file to. */
  readonly uploadUrl: string;
  /** ISO-8601 expiry of the upload URL. */
  readonly expiresAt: string;
}

export interface CompleteUploadResult {
  readonly uploadId: string;
  /** Public URL (or local dev path) for the uploaded object. */
  readonly publicUrl: string;
}

export interface IStorageService {
  /** Create a pre-signed upload slot and return the upload URL. */
  presign(opts: { filename: string; contentType: string; userId: string }): Promise<PresignResult>;

  /** Mark an upload as complete and return its public URL. */
  complete(uploadId: string): Promise<CompleteUploadResult>;
}
