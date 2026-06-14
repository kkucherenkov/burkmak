final _urlPattern = RegExp(r'https?://[^\s]+', caseSensitive: false);

/// Returns the first http(s) URL found in shared text, or null if none.
/// Shared content can be a bare URL or a sentence containing one.
String? extractFirstUrl(String? text) {
  if (text == null) return null;
  final match = _urlPattern.firstMatch(text.trim());
  return match?.group(0);
}
