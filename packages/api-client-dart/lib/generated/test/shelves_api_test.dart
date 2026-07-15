import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';


/// tests for ShelvesApi
void main() {
  final instance = AppApiClient().getShelvesApi();

  group(ShelvesApi, () {
    // Add an item to a shelf (idempotent)
    //
    // Adds the item to the shelf. Idempotent — calling again when the item is already on the shelf is a no-op.
    //
    //Future addItemToShelf(String id, String itemId) async
    test('test addItemToShelf', () async {
      // TODO
    });

    // Create a shelf
    //
    // Creates a new shelf owned by the authenticated user. Shelf names must be unique per user.
    //
    //Future<Shelf> createShelf(CreateShelfRequest createShelfRequest) async
    test('test createShelf', () async {
      // TODO
    });

    // Delete a shelf
    //
    // Permanently deletes the shelf. Items that were on the shelf are not deleted.
    //
    //Future deleteShelf(String id) async
    test('test deleteShelf', () async {
      // TODO
    });

    // List shelves with item counts
    //
    // Returns all shelves belonging to the authenticated user, each with its current item count.
    //
    //Future<ShelfList> listShelves() async
    test('test listShelves', () async {
      // TODO
    });

    // Remove an item from a shelf
    //
    // Removes the item from the shelf. Does not delete the item or the shelf.
    //
    //Future removeItemFromShelf(String id, String itemId) async
    test('test removeItemFromShelf', () async {
      // TODO
    });

    // Rename a shelf
    //
    // Renames the shelf and bumps `lastModified`. Returns 404 if the shelf does not exist or is not owned by the authenticated user.
    //
    //Future<Shelf> renameShelf(String id, RenameShelfRequest renameShelfRequest) async
    test('test renameShelf', () async {
      // TODO
    });

  });
}
