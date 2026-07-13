import { existsSync, statSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Injectable } from '@nestjs/common';

import { AppConfig } from '../../../common/config/app-config';

export type EpubVariant = 'epub' | 'kepub';

/**
 * Disk cache for built EPUB/KEPUB files.
 * Layout: ${dataDir}/epub/<itemId>/<variant>-<extractedAtSafe>.epub
 * Mirrors the image cache pattern.
 */
@Injectable()
export class EpubCache {
  constructor(private readonly config: AppConfig) {}

  cachePath(itemId: string, variant: EpubVariant, extractedAt: string): string {
    // Make extractedAt safe for a filename (replace colons and dots with dashes)
    const safe = extractedAt.replaceAll(':', '-').replaceAll('.', '-');
    const epubRoot = path.resolve(this.config.dataDir, 'epub');
    const filePath = path.resolve(epubRoot, itemId, `${variant}-${safe}.epub`);
    // Containment check: itemId/extractedAt are validated upstream, but a
    // path built from external segments never leaves this method unverified.
    if (!filePath.startsWith(epubRoot + path.sep)) {
      throw new Error(`EpubCache: unsafe cache path for item ${itemId}`);
    }
    return filePath;
  }

  exists(filePath: string): boolean {
    return existsSync(filePath);
  }

  /** Byte size of a cached file, or 0 when it hasn't been built yet (e.g. sync's DownloadUrls.Size). */
  size(filePath: string): number {
    return existsSync(filePath) ? statSync(filePath).size : 0;
  }

  async read(filePath: string): Promise<Uint8Array> {
    const buf = await readFile(filePath);
    return new Uint8Array(buf);
  }

  async write(filePath: string, bytes: Uint8Array): Promise<void> {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, bytes);
  }
}
