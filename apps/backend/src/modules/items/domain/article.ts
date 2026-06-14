import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import sanitizeHtml from 'sanitize-html';

export interface ParsedArticle {
  title: string | null;
  contentHtml: string;
  contentText: string;
  wordCount: number;
  readingTimeMin: number;
}

// Security-critical allowlist: only structural/semantic tags needed for reader view.
// No script/style/form/iframe/object/embed — ever.
// Note: h1/h2/figure/figcaption are already in sanitizeHtml.defaults.allowedTags;
// 'img' is not, so we add only that.
const ALLOWED_TAGS = [...sanitizeHtml.defaults.allowedTags, 'img'].filter(
  (t) => t !== 'script' && t !== 'style',
);

export function parseArticle(html: string, _url: string, wpm = 200): ParsedArticle {
  // linkedom's parseHTML returns `Window & typeof globalThis` — untyped in tsconfig
  // (lib: ES2023 only, no DOM lib). Suppression is justified: parseHTML is always
  // called with a valid html string; document is structurally a DOM Document.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { document } = parseHTML(html);

  // tsconfig.build.json uses lib:["ES2023"] (no DOM) while tsconfig.test.json inherits DOM.
  // Use @ts-ignore (rather than @ts-expect-error) so it works across both configs.
  // linkedom's document IS structurally compatible with Readability's Document at runtime.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Document type inconsistency across build/test tsconfig lib sets
  const reader = new Readability(document);
  const result = reader.parse(); // { title, content, textContent, length } | null

  // Readability.length is the character count of extracted text content.
  // Treat results with fewer than 20 meaningful chars as "no article found".
  const hasContent = result !== null && (result.length ?? 0) >= 20;

  const rawHtml = hasContent ? (result.content ?? '') : '';

  const contentHtml = rawHtml
    ? sanitizeHtml(rawHtml, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: {
          a: ['href', 'rel', 'target'],
          img: ['src', 'alt', 'width', 'height'],
          '*': [],
        },
        transformTags: {
          a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
        },
      })
    : '';

  const contentText = hasContent ? (result.textContent ?? '').replaceAll(/\s+/g, ' ').trim() : '';
  const wordCount = contentText ? contentText.split(' ').length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / wpm));

  return {
    title: result?.title ?? null,
    contentHtml,
    contentText,
    wordCount: contentText ? wordCount : 0,
    readingTimeMin: contentText ? readingTimeMin : 1,
  };
}
