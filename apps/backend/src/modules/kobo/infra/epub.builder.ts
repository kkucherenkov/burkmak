import JSZip from 'jszip';

export interface EpubImage {
  name: string;
  mediaType: string;
  data: Uint8Array;
}

export interface EpubInput {
  item: {
    id: string;
    title: string;
    url: string;
    siteName: string;
    lang?: string;
  };
  article: {
    contentHtml: string;
  };
  images: EpubImage[];
  /** ISO 8601 modified date; defaults to '1970-01-01T00:00:00Z' for determinism. */
  modified?: string;
}

/** XML-escape text content. */
function xmlEscape(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/** Escape all RegExp metacharacters so external values can be embedded in a pattern. */
function escapeRegExp(text: string): string {
  return text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Rewrite image src attributes from the API path to local EPUB paths.
 * `/api/v1/items/<id>/image/<key>` → `images/<key>`
 */
function rewriteImageSrcs(html: string, itemId: string): string {
  const prefix = `/api/v1/items/${itemId}/image/`;
  return html.replaceAll(
    new RegExp(`src="${escapeRegExp(prefix)}([^"]+)"`, 'g'),
    'src="images/$1"',
  );
}

function buildContainer(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

function buildOpf(
  id: string,
  title: string,
  url: string,
  siteName: string,
  lang: string,
  modified: string,
  images: EpubImage[],
): string {
  const imageManifest = images
    .map(
      (img, i) =>
        `    <item id="img${i.toString()}" href="images/${xmlEscape(img.name)}" media-type="${xmlEscape(img.mediaType)}"/>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" xml:lang="${xmlEscape(lang)}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:burkmak:${xmlEscape(id)}</dc:identifier>
    <dc:title>${xmlEscape(title)}</dc:title>
    <dc:language>${xmlEscape(lang)}</dc:language>
    <dc:source>${xmlEscape(url)}</dc:source>
    <dc:creator>${xmlEscape(siteName)}</dc:creator>
    <meta property="dcterms:modified">${xmlEscape(modified)}</meta>
  </metadata>
  <manifest>
    <item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
${imageManifest}  </manifest>
  <spine>
    <itemref idref="chapter"/>
  </spine>
</package>`;
}

function buildNav(title: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head><title>${xmlEscape(title)}</title></head>
  <body>
    <nav epub:type="toc" id="toc">
      <ol>
        <li><a href="chapter.xhtml">${xmlEscape(title)}</a></li>
      </ol>
    </nav>
  </body>
</html>`;
}

function buildChapter(title: string, contentHtml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head><title>${xmlEscape(title)}</title></head>
  <body>
${contentHtml}
  </body>
</html>`;
}

/**
 * Build a valid EPUB3 zip from an article.
 * Returns a Uint8Array containing the complete zip file.
 * mimetype is always stored first, uncompressed (EPUB spec §3.3).
 */
export async function buildEpub(input: EpubInput): Promise<Uint8Array> {
  const { item, article, images } = input;
  const lang = item.lang ?? 'en';
  const modified = input.modified ?? '1970-01-01T00:00:00Z';

  // Rewrite image src attributes before packaging
  const chapterHtml = rewriteImageSrcs(article.contentHtml, item.id);

  const zip = new JSZip();

  // mimetype MUST be first and STORED (not compressed) — EPUB spec requirement
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  zip.file('META-INF/container.xml', buildContainer());
  zip.file(
    'OEBPS/content.opf',
    buildOpf(item.id, item.title, item.url, item.siteName, lang, modified, images),
  );
  zip.file('OEBPS/nav.xhtml', buildNav(item.title));
  zip.file('OEBPS/chapter.xhtml', buildChapter(item.title, chapterHtml));

  for (const img of images) {
    zip.file(`OEBPS/images/${img.name}`, img.data);
  }

  return zip.generateAsync({ type: 'uint8array' });
}
