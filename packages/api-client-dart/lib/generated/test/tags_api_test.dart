import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';


/// tests for TagsApi
void main() {
  final instance = AppApiClient().getTagsApi();

  group(TagsApi, () {
    // Delete a tag and remove it from all items
    //
    // Permanently deletes the tag and cascades removal from all items that carry it. This operation cannot be undone.
    //
    //Future deleteTag(String id) async
    test('test deleteTag', () async {
      // TODO
    });

    // List all tags for the authenticated user
    //
    // Returns every tag that belongs to the authenticated user, ordered by name, with a count of associated items.
    //
    //Future<TagList> listTags() async
    test('test listTags', () async {
      // TODO
    });

    // Rename a tag (updates name; slug is re-derived server-side)
    //
    // Updates the display name of a tag. The slug is automatically re-derived from the new name server-side.
    //
    //Future renameTag(String id, RenameTagRequest renameTagRequest) async
    test('test renameTag', () async {
      // TODO
    });

  });
}
