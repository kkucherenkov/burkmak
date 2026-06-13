import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';


/// tests for ItemsApi
void main() {
  final instance = AppApiClient().getItemsApi();

  group(ItemsApi, () {
    // Add a tag to an item (creates the tag if it does not exist)
    //
    // Attaches a tag to the item by slug. If the tag does not yet exist for this user it is created automatically and a slug is derived from the provided name.
    //
    //Future<Item> addItemTag(String id, AddTagRequest addTagRequest) async
    test('test addItemTag', () async {
      // TODO
    });

    // Permanently delete an item
    //
    // Permanently removes the item and all its tag associations. This operation cannot be undone.
    //
    //Future deleteItem(String id) async
    test('test deleteItem', () async {
      // TODO
    });

    // Fetch a single item by ID
    //
    // Returns the full item record for the given ID, scoped to the authenticated user.
    //
    //Future<Item> getItem(String id) async
    test('test getItem', () async {
      // TODO
    });

    // List saved items with optional filtering
    //
    // Returns a cursor-paginated list of the authenticated user's saved items. Supports filtering by read state, tag, favourite flag, and full-text search.
    //
    //Future<ItemList> listItems({ ReadState readState, String tag, bool favorite, String q, String cursor, int limit }) async
    test('test listItems', () async {
      // TODO
    });

    // Remove a tag from an item
    //
    // Detaches the specified tag from the item. The tag record itself is not deleted; use `DELETE /api/v1/tags/{id}` for that.
    //
    //Future removeItemTag(String id, String tagSlug) async
    test('test removeItemTag', () async {
      // TODO
    });

    // Save a new URL to the reading list
    //
    // Creates an item with status `pending`. A background job is dispatched to fetch metadata (title, excerpt, images). The item becomes `ready` or `failed` asynchronously.
    //
    //Future<Item> saveItem(SaveItemRequest saveItemRequest) async
    test('test saveItem', () async {
      // TODO
    });

    // Update read state or favourite flag on an item
    //
    // Partially updates an item. At least one of `readState` or `favorite` must be provided. Setting `readState` to `read` for the first time records `readAt`.
    //
    //Future<Item> updateItem(String id, UpdateItemRequest updateItemRequest) async
    test('test updateItem', () async {
      // TODO
    });

  });
}
