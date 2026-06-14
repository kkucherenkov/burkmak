import 'package:app_api_client/app_api_client.dart';

class ItemsRepository {
  ItemsRepository(this._items, this._tags);

  final ItemsApi _items;
  final TagsApi _tags;

  Future<ItemList> listItems({
    ReadState? readState,
    bool? favorite,
    String? tag,
    String? q,
    String? cursor,
  }) async {
    final res = await _items.listItems(
      readState: readState,
      favorite: favorite,
      tag: tag,
      q: q,
      cursor: cursor,
      limit: 20,
    );
    return res.data!;
  }

  Future<Item> getItem(String id) async => (await _items.getItem(id: id)).data!;

  Future<Item> saveItem(String url) async {
    // ignore: avoid_dynamic_calls
    final req = SaveItemRequest((b) => (b as dynamic)..url = url);
    return (await _items.saveItem(saveItemRequest: req)).data!;
  }

  Future<Item> updateItem(
    String id, {
    ReadState? readState,
    bool? favorite,
  }) async {
    final req = UpdateItemRequest((b) {
      final d = b as dynamic; // ignore: avoid_dynamic_calls
      if (readState != null) d.readState = readState;
      if (favorite != null) d.favorite = favorite;
    });
    return (await _items.updateItem(id: id, updateItemRequest: req)).data!;
  }

  Future<void> deleteItem(String id) async {
    await _items.deleteItem(id: id);
  }

  Future<Item> addTag(String id, String tag) async {
    // ignore: avoid_dynamic_calls
    final req = AddTagRequest((b) => (b as dynamic)..tag = tag);
    return (await _items.addItemTag(id: id, addTagRequest: req)).data!;
  }

  Future<void> removeTag(String id, String tagSlug) async {
    await _items.removeItemTag(id: id, tagSlug: tagSlug);
  }

  Future<TagList> listTags() async => (await _tags.listTags()).data!;
}
