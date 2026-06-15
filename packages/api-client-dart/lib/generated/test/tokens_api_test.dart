import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';


/// tests for TokensApi
void main() {
  final instance = AppApiClient().getTokensApi();

  group(TokensApi, () {
    // Create a personal access token
    //
    // Creates a new personal access token for the authenticated user and returns the **full plaintext secret exactly once** — it is not stored and cannot be retrieved again. The caller must copy it immediately.  The token string has the format `burk_pat_` followed by 43 base64url characters (32 random bytes). It can be used as: - `Authorization: Bearer <token>` (Obsidian, REST clients) - HTTP Basic password, any username (OPDS/Kobo clients) 
    //
    //Future<PersonalAccessTokenCreated> createToken(CreateTokenRequest createTokenRequest) async
    test('test createToken', () async {
      // TODO
    });

    // List the authenticated user's personal access tokens
    //
    // Returns all non-revoked personal access tokens for the authenticated user. The secret and hash are **never** returned; only the display prefix is included for identification. 
    //
    //Future<TokenList> listTokens() async
    test('test listTokens', () async {
      // TODO
    });

    // Revoke a personal access token
    //
    // Permanently revokes the token by recording a `revokedAt` timestamp. Returns `404` if the token does not exist or is not owned by the authenticated user. Immediately invalidates the token; in-flight requests using the token may still succeed if they passed the auth check before revocation. 
    //
    //Future revokeToken(String id) async
    test('test revokeToken', () async {
      // TODO
    });

  });
}
