/**
 * Generates a stable, collision-safe filename for an exported Obsidian note.
 *
 * - Lowercases the title, replaces runs of non-alphanumeric chars with `-`,
 *   trims leading/trailing dashes, then appends `-<id>` (id also slugged).
 * - If title is null/empty, returns `<id>.md`.
 */
export function slugFilename(title: string | null | undefined, id: string): string {
  const idSlug = id
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');

  if (!title) {
    return `${idSlug}.md`;
  }

  const titleSlug = title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');

  if (!titleSlug) {
    return `${idSlug}.md`;
  }

  return `${titleSlug}-${idSlug}.md`;
}
