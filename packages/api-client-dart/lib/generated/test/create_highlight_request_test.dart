import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';

// tests for CreateHighlightRequest
void main() {
  final instance = CreateHighlightRequestBuilder();
  // TODO add properties to the builder and call build()

  group(CreateHighlightRequest, () {
    // The exact text that was highlighted
    // String quote
    test('to test the property `quote`', () async {
      // TODO
    });

    // Short text immediately before the quote (for anchor context)
    // String prefix
    test('to test the property `prefix`', () async {
      // TODO
    });

    // Short text immediately after the quote (for anchor context)
    // String suffix
    test('to test the property `suffix`', () async {
      // TODO
    });

    // Optional reader note to attach. To clear a note on an existing highlight, use `PATCH /highlights/{id}` with `note: null` — create only sets a note, it cannot null one. 
    // String note
    test('to test the property `note`', () async {
      // TODO
    });

    // HighlightColor color
    test('to test the property `color`', () async {
      // TODO
    });

  });
}
