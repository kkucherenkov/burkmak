import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';

// tests for PersonalAccessTokenCreated
void main() {
  final instance = PersonalAccessTokenCreatedBuilder();
  // TODO add properties to the builder and call build()

  group(PersonalAccessTokenCreated, () {
    // Unique token ID (cuid)
    // String id
    test('to test the property `id`', () async {
      // TODO
    });

    // Human-readable label
    // String name
    test('to test the property `name`', () async {
      // TODO
    });

    // First ~12 characters for visual identification
    // String prefix
    test('to test the property `prefix`', () async {
      // TODO
    });

    // Full plaintext token (`burk_pat_` + 43 base64url chars). Store this value securely — it will not be shown again. 
    // String token
    test('to test the property `token`', () async {
      // TODO
    });

    // ISO-8601 timestamp when the token was created
    // DateTime createdAt
    test('to test the property `createdAt`', () async {
      // TODO
    });

  });
}
