import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';


/// tests for HighlightsApi
void main() {
  final instance = AppApiClient().getHighlightsApi();

  group(HighlightsApi, () {
    // Create a highlight on an item
    //
    // Saves a new text highlight (with optional note and color) on the given item.
    //
    //Future<Highlight> createHighlight(String id, CreateHighlightRequest createHighlightRequest) async
    test('test createHighlight', () async {
      // TODO
    });

    // Delete a highlight
    //
    // Permanently removes the highlight. This operation cannot be undone.
    //
    //Future deleteHighlight(String id) async
    test('test deleteHighlight', () async {
      // TODO
    });

    // List all highlights on an item
    //
    // Returns all highlights the authenticated user has created on the given item.
    //
    //Future<HighlightList> listHighlights(String id) async
    test('test listHighlights', () async {
      // TODO
    });

    // Update a highlight's note or color
    //
    // Partially updates a highlight. At least one of `note` or `color` must be provided.
    //
    //Future<Highlight> updateHighlight(String id, UpdateHighlightRequest updateHighlightRequest) async
    test('test updateHighlight', () async {
      // TODO
    });

  });
}
