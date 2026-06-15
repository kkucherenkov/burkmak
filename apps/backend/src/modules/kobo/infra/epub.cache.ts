import { existsSync } from 'node:fs';
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
    const epubDir = path.join(this.config.dataDir, 'epub', itemId);
    return path.join(epubDir, `${variant}-${safe}.epub`);
  }

  exists(filePath: string): boolean {
    return existsSync(filePath);
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
