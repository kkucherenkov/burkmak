/** XML-escape text content. */
function xmlEscape(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export interface OpdsFeedItem {
  id: string;
  title: string;
  siteName: string | null;
  excerpt: string | null;
  savedAt: string;
}

export interface OpdsFeedInput {
  baseUrl: string;
  updated: string;
  items: OpdsFeedItem[];
}

/**
 * Build an OPDS 1.2 acquisition feed (Atom XML).
 * Each entry has an acquisition link pointing to the EPUB download endpoint.
 */
export function buildOpdsFeed(input: OpdsFeedInput): string {
  const { baseUrl, updated, items } = input;

  const entries = items
    .map((item) => {
      const authorBlock =
        item.siteName === null
          ? ''
          : `    <author><name>${xmlEscape(item.siteName)}</name></author>\n`;
      const summaryBlock =
        item.excerpt === null ? '' : `    <summary>${xmlEscape(item.excerpt)}</summary>\n`;

      return `  <entry>
    <title>${xmlEscape(item.title)}</title>
    <id>urn:burkmak:${xmlEscape(item.id)}</id>
${authorBlock}${summaryBlock}    <updated>${xmlEscape(item.savedAt)}</updated>
    <link rel="http://opds-spec.org/acquisition" type="application/epub+zip" href="${xmlEscape(`${baseUrl}/items/${item.id}/epub`)}"/>
  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:opds="http://opds-spec.org/2010/catalog">
  <title>burkmak — Saved Articles</title>
  <id>urn:burkmak:opds:catalog</id>
  <updated>${xmlEscape(updated)}</updated>
  <link rel="self" type="application/atom+xml;profile=opds-catalog;kind=acquisition" href="${xmlEscape(`${baseUrl}/opds`)}"/>
${entries}
</feed>`;
}
