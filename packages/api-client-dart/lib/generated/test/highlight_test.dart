import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';

// tests for Highlight
void main() {
  final instance = HighlightBuilder();
  // TODO add properties to the builder and call build()

  group(Highlight, () {
    // Unique highlight ID (cuid)
    // String id
    test('to test the property `id`', () async {
      // TODO
    });

    // ID of the item this highlight belongs to (cuid)
    // String itemId
    test('to test the property `itemId`', () async {
      // TODO
    });

    // The exact text that was highlighted
    // String quote
    test('to test the property `quote`', () async {
      // TODO
    });

    // Short text immediately before the highlighted quote (for anchor context)
    // String prefix
    test('to test the property `prefix`', () async {
      // TODO
    });

    // Short text immediately after the highlighted quote (for anchor context)
    // String suffix
    test('to test the property `suffix`', () async {
      // TODO
    });

    // Optional reader note attached to the highlight
    // String note
    test('to test the property `note`', () async {
      // TODO
    });

    // HighlightColor color
    test('to test the property `color`', () async {
      // TODO
    });

    // ISO-8601 timestamp when the highlight was created
    // DateTime createdAt
    test('to test the property `createdAt`', () async {
      // TODO
    });

  });
}
