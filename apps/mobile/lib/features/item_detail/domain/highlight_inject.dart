/// A pure utility for injecting `<mark>` tags into article HTML for highlights.
///
/// Limitation: works on single-text-run occurrences only. Highlights that span
/// multiple HTML nodes are not supported and will be silently skipped.

/// Anchor data needed to locate and mark a highlight in HTML text.
class HlAnchor {
  const HlAnchor({
    required this.quote,
    required this.prefix,
    required this.suffix,
    required this.color,
  });

  /// The exact text that was highlighted.
  final String quote;

  /// Short text immediately before the highlighted quote.
  final String prefix;

  /// Short text immediately after the highlighted quote.
  final String suffix;

  /// CSS color label: yellow | green | blue | pink.
  final String color;
}

/// Injects `<mark class="hl-{color}">…</mark>` tags into [html] for each
/// anchor in [highlights].
///
/// For each anchor it first tries to match `prefix + quote + suffix` in the
/// raw HTML string and replaces just the quote portion. If that composite
/// sequence is not found it falls back to the first bare occurrence of [quote].
///
/// Does NOT double-wrap: if [quote] already appears inside a `<mark …>` tag,
/// the anchor is skipped.
///
/// Returns the modified HTML string.
String injectHighlights(String html, List<HlAnchor> highlights) {
  var result = html;
  for (final anchor in highlights) {
    result = _injectOne(result, anchor);
  }
  return result;
}

String _injectOne(String html, HlAnchor anchor) {
  final mark = '<mark class="hl-${anchor.color}">${anchor.quote}</mark>';

  // Already marked — skip to avoid double-wrapping.
  if (html.contains(mark)) return html;

  // Attempt composite (prefix + quote + suffix) match first.
  if (anchor.prefix.isNotEmpty || anchor.suffix.isNotEmpty) {
    final composite = anchor.prefix + anchor.quote + anchor.suffix;
    final idx = html.indexOf(composite);
    if (idx != -1) {
      final replacement = anchor.prefix + mark + anchor.suffix;
      return html.replaceFirst(composite, replacement);
    }
  }

  // Fallback: bare first occurrence of the quote.
  final bareIdx = html.indexOf(anchor.quote);
  if (bareIdx == -1) return html; // quote not found — leave unchanged

  return html.replaceFirst(anchor.quote, mark);
}
