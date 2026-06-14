import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';


/// tests for ExtractionApi
void main() {
  final instance = AppApiClient().getExtractionApi();

  group(ExtractionApi, () {
    // Trigger article content extraction for an item
    //
    // Idempotent: always returns 202 and (re)starts extraction, replacing any existing article. No request body. Safe to call in any `extractStatus` state (`none`, `failed`, or `ready`). The item's `extractStatus` transitions to `extracting` immediately and becomes `ready` or `failed` asynchronously. 
    //
    //Future<ExtractAccepted> extractArticle(String id) async
    test('test extractArticle', () async {
      // TODO
    });

    // Get extracted article content for an item
    //
    // Returns the full extracted article body (HTML and plain text) for the given item. Returns 404 if the article has not been extracted yet.
    //
    //Future<Article> getArticle(String id) async
    test('test getArticle', () async {
      // TODO
    });

    // Retrieve a cached image associated with an item
    //
    // Streams a cached image file that was downloaded during article extraction. Returns 404 if the image key does not exist or is not owned by the authenticated user.
    //
    //Future<Uint8List> getItemImage(String id, String key) async
    test('test getItemImage', () async {
      // TODO
    });

  });
}
