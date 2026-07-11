/** XML-escape text content. */
function xmlEscape(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/** MIME type for a cover link, guessed from the href's file extension. */
function imageMimeType(href: string): string {
  const ext = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(href)?.[1]?.toLowerCase();
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
  };
  // Unknown extension (e.g. a remote og:image without one) — jpeg is the
  // least-surprising hint; OPDS clients sniff the real type anyway.
  return map[ext ?? ''] ?? 'image/jpeg';
}

export interface OpdsFeedItem {
  id: string;
  title: string;
  siteName: string | null;
  excerpt: string | null;
  savedAt: string;
  /** Absolute cover image URL, or null when the item has none. */
  coverHref: string | null;
}

export interface OpdsFeedInput {
  baseUrl: string;
  updated: string;
  items: OpdsFeedItem[];
  /** The URL of this page of the feed (including cursor/q query params). */
  selfHref: string;
  /** URL of the next page, or null on the last page. */
  nextHref: string | null;
}

const ACQUISITION_TYPE = 'application/atom+xml;profile=opds-catalog;kind=acquisition';

/**
 * Build an OPDS 1.2 acquisition feed (Atom XML).
 * Each entry has an acquisition link pointing to the EPUB download endpoint,
 * plus cover/thumbnail links when a cover is known. The feed advertises
 * OpenSearch (`rel="search"`) and paginates via `rel="next"`.
 */
export function buildOpdsFeed(input: OpdsFeedInput): string {
  const { baseUrl, updated, items, selfHref, nextHref } = input;

  const entries = items
    .map((item) => {
      const authorBlock =
        item.siteName === null
          ? ''
          : `    <author><name>${xmlEscape(item.siteName)}</name></author>\n`;
      const summaryBlock =
        item.excerpt === null ? '' : `    <summary>${xmlEscape(item.excerpt)}</summary>\n`;
      const coverBlock =
        item.coverHref === null
          ? ''
          : `    <link rel="http://opds-spec.org/image" type="${imageMimeType(item.coverHref)}" href="${xmlEscape(item.coverHref)}"/>
    <link rel="http://opds-spec.org/image/thumbnail" type="${imageMimeType(item.coverHref)}" href="${xmlEscape(item.coverHref)}"/>\n`;

      return `  <entry>
    <title>${xmlEscape(item.title)}</title>
    <id>urn:burkmak:${xmlEscape(item.id)}</id>
${authorBlock}${summaryBlock}${coverBlock}    <updated>${xmlEscape(item.savedAt)}</updated>
    <link rel="http://opds-spec.org/acquisition" type="application/epub+zip" href="${xmlEscape(`${baseUrl}/items/${item.id}/epub`)}"/>
  </entry>`;
    })
    .join('\n');

  const nextLink =
    nextHref === null
      ? ''
      : `  <link rel="next" type="${ACQUISITION_TYPE}" href="${xmlEscape(nextHref)}"/>\n`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:opds="http://opds-spec.org/2010/catalog">
  <title>burkmak — Saved Articles</title>
  <id>urn:burkmak:opds:catalog</id>
  <updated>${xmlEscape(updated)}</updated>
  <link rel="self" type="${ACQUISITION_TYPE}" href="${xmlEscape(selfHref)}"/>
  <link rel="start" type="${ACQUISITION_TYPE}" href="${xmlEscape(`${baseUrl}/opds`)}"/>
  <link rel="search" type="application/opensearchdescription+xml" href="${xmlEscape(`${baseUrl}/opds/opensearch.xml`)}"/>
${nextLink}${entries}
</feed>`;
}

/**
 * OpenSearch 1.1 description document advertising the OPDS search endpoint.
 * Discovered through the feed's `rel="search"` link; the client substitutes
 * `{searchTerms}` into the template.
 */
export function buildOpenSearchDescription(baseUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>burkmak</ShortName>
  <Description>Search your saved articles</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <OutputEncoding>UTF-8</OutputEncoding>
  <Url type="${ACQUISITION_TYPE}" template="${xmlEscape(`${baseUrl}/opds`)}?q={searchTerms}"/>
</OpenSearchDescription>`;
}
