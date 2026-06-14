import { Injectable } from '@nestjs/common';

import { safeFetch } from '../../../common/net/safe-fetch';
import { parseMetadata, type ParsedMetadata } from '../domain/metadata';

export const METADATA_FETCHER = Symbol('METADATA_FETCHER');

export interface IMetadataFetcher {
  fetch(url: string): Promise<ParsedMetadata>;
}

@Injectable()
export class HttpMetadataFetcher implements IMetadataFetcher {
  async fetch(url: string): Promise<ParsedMetadata> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 10_000);
    try {
      // safeFetch validates scheme + resolves hostname against blocked ranges,
      // and follows redirects manually (re-checking each hop) — SSRF guard.
      const res = await safeFetch(url, {
        signal: controller.signal,
        headers: { 'user-agent': 'burkmak/1.0 (+self-hosted read-it-later)' },
      });
      const text = await res.text();
      const html = text.slice(0, 2_000_000); // size cap
      return parseMetadata(html, res.url || url);
    } finally {
      clearTimeout(timeout);
    }
  }
}
