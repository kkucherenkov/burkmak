import 'package:app_api_client/app_api_client.dart';

/// Repository for article content and highlights.
///
/// Wraps [ExtractionApi] and [HighlightsApi] from the generated client.
/// Registered as a lazySingleton in the DI container.
class ArticleRepository {
  ArticleRepository(this._extraction, this._highlights);

  final ExtractionApi _extraction;
  final HighlightsApi _highlights;

  /// Triggers article extraction for [itemId]. Idempotent — always 202.
  Future<void> extract(String itemId) async {
    await _extraction.extractArticle(id: itemId);
  }

  /// Returns the extracted [Article] for [itemId].
  /// Throws if not yet extracted (404 → DioException).
  Future<Article> getArticle(String itemId) async =>
      (await _extraction.getArticle(id: itemId)).data!;

  /// Returns all [Highlight]s for [itemId] owned by the authenticated user.
  Future<List<Highlight>> listHighlights(String itemId) async =>
      (await _highlights.listHighlights(id: itemId)).data!.highlights.toList();
}
