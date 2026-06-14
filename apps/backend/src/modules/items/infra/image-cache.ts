import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Injectable, Logger } from '@nestjs/common';

import { AppConfig } from '../../../common/config/app-config';
import { safeFetch } from '../../../common/net/safe-fetch';
import type { IImageCache } from '../domain/article.ports';

/** Maximum images to download per article. */
const MAX_IMAGES = 20;
/** Per-image download timeout in milliseconds. */
const IMAGE_TIMEOUT_MS = 8000;
/** Per-image size cap in bytes (5 MB). */
const IMAGE_SIZE_CAP = 5 * 1024 * 1024;

/** Allowed image MIME types. SVG excluded — it can embed <script> (stored-XSS risk). */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]);

/**
 * Downloads images referenced in article HTML, stores them under
 * `${dataDir}/images/${itemId}/`, and rewrites src attributes to
 * local API paths (`/api/v1/items/${itemId}/image/${key}.${ext}`).
 *
 * Per-image failures are non-fatal — the remote src is retained on error.
 */
@Injectable()
export class LocalImageCache implements IImageCache {
  private readonly logger = new Logger(LocalImageCache.name);

  constructor(private readonly config: AppConfig) {}

  async cache(itemId: string, contentHtml: string, baseUrl: string): Promise<string> {
    const srcs = extractImgSrcs(contentHtml);
    if (srcs.length === 0) return contentHtml;

    const dir = path.join(this.config.dataDir, 'images', itemId);
    await mkdir(dir, { recursive: true });

    let result = contentHtml;
    const toProcess = srcs.slice(0, MAX_IMAGES);

    for (const src of toProcess) {
      const absolute = resolveUrl(src, baseUrl);
      if (!absolute) continue;

      try {
        const { data, ext } = await downloadImage(absolute);
        const key = sha1(absolute);
        const filename = `${key}.${ext}`;
        await writeFile(path.join(dir, filename), data);
        const localPath = `/api/v1/items/${itemId}/image/${filename}`;
        // Replace only this specific src (exact match, attribute-context-aware)
        result = result.replaceAll(`src="${src}"`, `src="${localPath}"`);
      } catch (error) {
        // Non-fatal: keep remote src
        this.logger.warn(`Image cache: skipped ${absolute} for item ${itemId}: ${String(error)}`);
      }
    }

    return result;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract all img src attribute values from HTML string. */
export function extractImgSrcs(html: string): string[] {
  const srcs: string[] = [];
  // Regex is sufficient — we don't need a full DOM parse for src extraction.
  // This avoids the linkedom typing issues and is simpler/faster.
  const re = /<img\b[^>]*\bsrc="([^"]+)"/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    if (match[1]) srcs.push(match[1]);
  }
  return [...new Set(srcs)]; // deduplicate
}

/** Resolve a potentially-relative URL against a base. Returns null if invalid. */
export function resolveUrl(src: string, base: string): string | null {
  if (src.startsWith('data:')) return null; // skip inline data URIs
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

/** SHA-1 hex of a string (used as a stable filename key). */
export function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex');
}

/** Download an image with SSRF guard, timeout, and size cap. Returns raw buffer + ext. */
async function downloadImage(url: string): Promise<{ data: Buffer; ext: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, IMAGE_TIMEOUT_MS);

  try {
    // safeFetch validates scheme + resolves hostname against blocked ranges,
    // and follows redirects manually (re-checking each hop).
    const res = await safeFetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'burkmak/1.0 (+self-hosted read-it-later)' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status.toString()} fetching image`);
    }

    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      throw new Error(`Blocked MIME type: ${contentType}`);
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > IMAGE_SIZE_CAP) {
      throw new Error(`Image too large: ${buffer.byteLength.toString()} bytes`);
    }

    // Fix 3: ext comes ONLY from the MIME allowlist. Never fall back to the
    // URL path (attacker-controlled text) — if the MIME is unknown, skip caching.
    const ext = extFromMime(contentType);
    if (!ext) {
      throw new Error(`No known extension for MIME type: ${contentType}`);
    }
    return { data: Buffer.from(buffer), ext };
  } finally {
    clearTimeout(timer);
  }
}

function extFromMime(mime: string): string | null {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  return map[mime] ?? null;
}
