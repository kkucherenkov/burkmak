import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';

// tests for PersonalAccessToken
void main() {
  final instance = PersonalAccessTokenBuilder();
  // TODO add properties to the builder and call build()

  group(PersonalAccessToken, () {
    // Unique token ID (cuid)
    // String id
    test('to test the property `id`', () async {
      // TODO
    });

    // Human-readable label assigned at creation
    // String name
    test('to test the property `name`', () async {
      // TODO
    });

    // First ~12 characters of the token for visual identification (e.g. \"burk_pat_ab12\")
    // String prefix
    test('to test the property `prefix`', () async {
      // TODO
    });

    // ISO-8601 timestamp of the most recent successful use; null if never used
    // DateTime lastUsedAt
    test('to test the property `lastUsedAt`', () async {
      // TODO
    });

    // ISO-8601 timestamp when the token was created
    // DateTime createdAt
    test('to test the property `createdAt`', () async {
      // TODO
    });

  });
}
