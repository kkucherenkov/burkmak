import 'package:app_api_client/app_api_client.dart';
import 'package:app_mobile/features/library/data/items_repository.dart';
import 'package:app_mobile/features/library/presentation/bloc/library_cubit.dart';
import 'package:app_mobile/features/library/presentation/bloc/library_state.dart';
import 'package:app_mobile/shared/network/events_client.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class _MockRepo extends Mock implements ItemsRepository {}

class _MockEvents extends Mock implements EventsClient {}

Item _item(
  String id, {
  ItemStatus status = ItemStatus.pending,
  ExtractStatus extractStatus = ExtractStatus.none,
}) => Item(
  (b) => b
    ..id = id
    ..url = 'https://x/$id'
    ..kind = Kind.article
    ..status = status
    ..extractStatus = extractStatus
    ..readState = ReadState.unread
    ..favorite = false
    ..savedAt = DateTime.utc(2026),
);

void main() {
  late _MockRepo repo;
  late _MockEvents events;

  setUp(() {
    repo = _MockRepo();
    events = _MockEvents();
    when(
      () => events.connect(),
    ).thenAnswer((_) => const Stream<AppEvent>.empty());
  });

  blocTest<LibraryCubit, LibraryState>(
    'load emits loading → ready with items',
    build: () {
      when(
        () => repo.listItems(
          readState: any(named: 'readState'),
          favorite: any(named: 'favorite'),
          tag: any(named: 'tag'),
          q: any(named: 'q'),
          cursor: any(named: 'cursor'),
        ),
      ).thenAnswer(
        (_) async => ItemList(
          (b) => b
            ..items.addAll([_item('a')])
            ..nextCursor = null,
        ),
      );
      return LibraryCubit(repo, events);
    },
    act: (c) => c.load(),
    expect: () => [
      isA<LibraryState>().having(
        (s) => s.status,
        'status',
        LibraryStatus.loading,
      ),
      isA<LibraryState>()
          .having((s) => s.status, 'status', LibraryStatus.ready)
          .having((s) => s.items.length, 'items', 1),
    ],
  );

  blocTest<LibraryCubit, LibraryState>(
    'applyEvent(item.updated) re-fetches and replaces in place (pending → ready)',
    build: () {
      when(
        () => repo.getItem('a'),
      ).thenAnswer((_) async => _item('a', status: ItemStatus.ready));
      return LibraryCubit(repo, events);
    },
    seed: () => LibraryState(status: LibraryStatus.ready, items: [_item('a')]),
    act: (c) => c.applyEvent(const AppEvent(type: 'item.updated', id: 'a')),
    expect: () => [
      isA<LibraryState>().having(
        (s) => s.items.first.status,
        'status',
        ItemStatus.ready,
      ),
    ],
  );

  blocTest<LibraryCubit, LibraryState>(
    'applyEvent(item.deleted) drops the item',
    build: () => LibraryCubit(repo, events),
    seed: () => LibraryState(
      status: LibraryStatus.ready,
      items: [_item('a'), _item('b')],
    ),
    act: (c) => c.applyEvent(const AppEvent(type: 'item.deleted', id: 'a')),
    expect: () => [
      isA<LibraryState>().having(
        (s) => s.items.map((i) => i.id).toList(),
        'ids',
        ['b'],
      ),
    ],
  );
}
