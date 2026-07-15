import 'package:app_api_client/app_api_client.dart';
import 'package:app_mobile/features/library/data/items_repository.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class _MockItemsApi extends Mock implements ItemsApi {}

class _MockTagsApi extends Mock implements TagsApi {}

void main() {
  test('listItems only ever requests articles (never bookmarks)', () async {
    final items = _MockItemsApi();
    final repo = ItemsRepository(items, _MockTagsApi());

    when(
      () => items.listItems(
        readState: any(named: 'readState'),
        favorite: any(named: 'favorite'),
        tag: any(named: 'tag'),
        q: any(named: 'q'),
        cursor: any(named: 'cursor'),
        limit: any(named: 'limit'),
        kind: any(named: 'kind'),
      ),
    ).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: '/items'),
        data: ItemList((b) => b
          ..items.replace(<Item>[])
          ..nextCursor = null),
      ),
    );

    await repo.listItems();

    verify(
      () => items.listItems(
        readState: null,
        favorite: null,
        tag: null,
        q: null,
        cursor: null,
        limit: 20,
        kind: Kind.article,
      ),
    ).called(1);
  });
}
