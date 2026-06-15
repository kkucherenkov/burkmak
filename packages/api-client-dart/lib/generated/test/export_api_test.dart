import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';


/// tests for ExportApi
void main() {
  final instance = AppApiClient().getExportApi();

  group(ExportApi, () {
    // Export a single item as a raw markdown note
    //
    // Returns the Obsidian-ready markdown for a single item as `text/markdown`. Useful for manual copy-paste or testing the renderer. The markdown format is identical to entries returned by `GET /api/v1/export/markdown`. Returns `404` if the item does not exist or is not owned by the caller. 
    //
    //Future<String> exportItemMarkdown(String id) async
    test('test exportItemMarkdown', () async {
      // TODO
    });

    // Export all matching items as Obsidian-ready markdown notes
    //
    // Returns a JSON bundle of markdown-rendered notes for the authenticated user's items. By default only items with at least one highlight are included. Use `?includeEmpty=true` to include items without highlights. Supports filtering by read state and a `since` cursor (items whose metadata or highlights changed after that timestamp). Results are ordered newest-first.  Designed to be consumed by the Obsidian plugin; each `ExportedNote` contains a stable `filename` and a YAML-frontmatter block whose `burkmakId` is the idempotency key for vault writes. 
    //
    //Future<ExportBundle> exportMarkdownBundle({ ReadState readState, DateTime since, bool includeEmpty }) async
    test('test exportMarkdownBundle', () async {
      // TODO
    });

  });
}
