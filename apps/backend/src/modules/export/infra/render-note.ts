import { slugFilename } from './slugify';

export interface NoteItem {
  id: string;
  title: string | null | undefined;
  url: string;
  canonicalUrl: string | null | undefined;
  siteName: string | null | undefined;
  savedAt: string;
  tags: string[];
  readingTimeMin?: number | null;
}

export interface NoteHighlight {
  quote: string;
  note: string | null | undefined;
  color: string;
}

export interface RenderedNote {
  itemId: string;
  title: string;
  filename: string;
  markdown: string;
}

/**
 * Characters that require YAML scalar quoting when they appear in a title.
 * Covers colon, hash, question mark, bracket, brace, pipe, dash (leading),
 * and leading space.
 */
const YAML_SPECIAL_RE = /[:#\-?[\]{}|]/;

function yamlScalar(value: string): string {
  if (YAML_SPECIAL_RE.test(value) || value.startsWith(' ')) {
    // Escape internal double-quotes by doubling them
    return `"${value.replaceAll('"', '\\"')}"`;
  }
  return value;
}

/**
 * Prefix each line of a multi-line quote with "> ".
 */
function blockquote(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

/**
 * Pure renderer: converts an item + its highlights into an Obsidian-ready
 * markdown note with YAML frontmatter.
 *
 * Returns `{ itemId, title, filename, markdown }`.
 */
export function renderNote(item: NoteItem, highlights: NoteHighlight[]): RenderedNote {
  const displayTitle = item.title ?? item.id;
  const filename = slugFilename(item.title ?? null, item.id);

  // --- YAML frontmatter ---
  const frontmatterLines: string[] = ['---', `burkmakId: ${item.id}`];

  frontmatterLines.push(`title: ${yamlScalar(displayTitle)}`);
  frontmatterLines.push(`url: ${item.url}`);

  if (item.canonicalUrl) {
    frontmatterLines.push(`canonicalUrl: ${item.canonicalUrl}`);
  }

  if (item.siteName) {
    frontmatterLines.push(`source: ${item.siteName}`);
  }

  frontmatterLines.push(`savedAt: ${item.savedAt}`);

  if (item.readingTimeMin != null) {
    frontmatterLines.push(`readingTimeMin: ${item.readingTimeMin}`);
  }

  if (item.tags.length > 0) {
    frontmatterLines.push('tags:');
    for (const tag of item.tags) {
      frontmatterLines.push(`  - ${tag}`);
    }
  }

  frontmatterLines.push('---');

  // --- Body ---
  const bodyLines: string[] = [];

  // H1 title linking to URL
  bodyLines.push(`# [${displayTitle}](${item.url})`);
  bodyLines.push('');

  // Metadata line — omit absent parts
  const metaParts: string[] = [];
  if (item.siteName) metaParts.push(item.siteName);
  const dateStr = item.savedAt.slice(0, 10); // YYYY-MM-DD
  metaParts.push(`saved ${dateStr}`);
  if (item.readingTimeMin != null) metaParts.push(`${item.readingTimeMin} min`);
  bodyLines.push(`*${metaParts.join(' · ')}*`);
  bodyLines.push('');

  // Highlights section
  if (highlights.length > 0) {
    bodyLines.push('## Highlights');
    bodyLines.push('');

    for (const h of highlights) {
      bodyLines.push(blockquote(h.quote));
      if (h.note) {
        bodyLines.push('');
        bodyLines.push(h.note);
      }
      bodyLines.push('');
      bodyLines.push(`*— ${h.color}*`);
      bodyLines.push('');
    }
  }

  const markdown = [...frontmatterLines, '', ...bodyLines].join('\n');

  return {
    itemId: item.id,
    title: displayTitle,
    filename,
    markdown,
  };
}
