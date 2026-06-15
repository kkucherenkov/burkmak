import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';

// tests for ExportedNote
void main() {
  final instance = ExportedNoteBuilder();
  // TODO add properties to the builder and call build()

  group(ExportedNote, () {
    // ID of the source item (cuid); also the `burkmakId` in the note's YAML frontmatter
    // String itemId
    test('to test the property `itemId`', () async {
      // TODO
    });

    // Item title (may be null if metadata extraction is not yet complete)
    // String title
    test('to test the property `title`', () async {
      // TODO
    });

    // Stable, filesystem-safe filename including the `.md` extension (e.g. `the-case-for-reading-slowly-cmqd.md`). Derived from the slugified title + a short id suffix; stable for a given item so the Obsidian plugin can overwrite the same file on re-sync. 
    // String filename
    test('to test the property `filename`', () async {
      // TODO
    });

    // Full markdown content including YAML frontmatter, article metadata, excerpt, and highlight blockquotes. 
    // String markdown
    test('to test the property `markdown`', () async {
      // TODO
    });

  });
}
