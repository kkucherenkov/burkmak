/**
 * Parses the `burkmakId` value from a YAML frontmatter block at the top of a
 * markdown file. Returns `null` if no frontmatter is found or the key is absent.
 */
export function parseBurkmakId(content: string): string | null {
  const frontmatterMatch = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!frontmatterMatch) return null;

  const block = frontmatterMatch[1];
  if (!block) return null;

  const lineMatch = /^burkmakId:\s*(.+)$/m.exec(block);
  if (!lineMatch) return null;

  const value = lineMatch[1]?.trim();
  return value ?? null;
}
