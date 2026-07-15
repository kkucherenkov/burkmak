import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';

// tests for Shelf
void main() {
  final instance = ShelfBuilder();
  // TODO add properties to the builder and call build()

  group(Shelf, () {
    // Unique shelf ID (uuid; doubles as the Kobo Tag.Id)
    // String id
    test('to test the property `id`', () async {
      // TODO
    });

    // String name
    test('to test the property `name`', () async {
      // TODO
    });

    // Number of items currently on the shelf
    // int itemCount
    test('to test the property `itemCount`', () async {
      // TODO
    });

    // DateTime createdAt
    test('to test the property `createdAt`', () async {
      // TODO
    });

    // Bumped on rename and on any membership change
    // DateTime lastModified
    test('to test the property `lastModified`', () async {
      // TODO
    });

  });
}
