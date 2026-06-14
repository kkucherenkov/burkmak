import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';

// tests for Article
void main() {
  final instance = ArticleBuilder();
  // TODO add properties to the builder and call build()

  group(Article, () {
    // Full article body as HTML
    // String contentHtml
    test('to test the property `contentHtml`', () async {
      // TODO
    });

    // Full article body as plain text (HTML stripped)
    // String contentText
    test('to test the property `contentText`', () async {
      // TODO
    });

    // Number of words in the extracted article
    // int wordCount
    test('to test the property `wordCount`', () async {
      // TODO
    });

    // Estimated reading time in minutes
    // int readingTimeMin
    test('to test the property `readingTimeMin`', () async {
      // TODO
    });

    // ISO-8601 timestamp when the extraction completed
    // DateTime extractedAt
    test('to test the property `extractedAt`', () async {
      // TODO
    });

  });
}
