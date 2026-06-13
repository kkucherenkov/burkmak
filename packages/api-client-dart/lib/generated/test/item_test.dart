import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';

// tests for Item
void main() {
  final instance = ItemBuilder();
  // TODO add properties to the builder and call build()

  group(Item, () {
    // Unique item ID (cuid)
    // String id
    test('to test the property `id`', () async {
      // TODO
    });

    // Original URL submitted by the user
    // String url
    test('to test the property `url`', () async {
      // TODO
    });

    // Canonical URL resolved during metadata extraction
    // String canonicalUrl
    test('to test the property `canonicalUrl`', () async {
      // TODO
    });

    // Page title
    // String title
    test('to test the property `title`', () async {
      // TODO
    });

    // Name of the publishing site
    // String siteName
    test('to test the property `siteName`', () async {
      // TODO
    });

    // Short plain-text excerpt
    // String excerpt
    test('to test the property `excerpt`', () async {
      // TODO
    });

    // Hero/lead image URL
    // String leadImageUrl
    test('to test the property `leadImageUrl`', () async {
      // TODO
    });

    // Site favicon URL
    // String faviconUrl
    test('to test the property `faviconUrl`', () async {
      // TODO
    });

    // ItemStatus status
    test('to test the property `status`', () async {
      // TODO
    });

    // ReadState readState
    test('to test the property `readState`', () async {
      // TODO
    });

    // Whether the item is marked as a favourite
    // bool favorite
    test('to test the property `favorite`', () async {
      // TODO
    });

    // ISO-8601 timestamp when the item was saved
    // DateTime savedAt
    test('to test the property `savedAt`', () async {
      // TODO
    });

    // ISO-8601 timestamp when the item was first marked read
    // DateTime readAt
    test('to test the property `readAt`', () async {
      // TODO
    });

    // Slugs of tags attached to this item
    // BuiltList<String> tags
    test('to test the property `tags`', () async {
      // TODO
    });

  });
}
