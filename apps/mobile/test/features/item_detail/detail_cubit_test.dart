import 'package:app_api_client/app_api_client.dart';
import 'package:app_mobile/features/item_detail/presentation/bloc/detail_cubit.dart';
import 'package:app_mobile/features/item_detail/presentation/bloc/detail_state.dart';
import 'package:app_mobile/features/library/data/items_repository.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class _MockRepo extends Mock implements ItemsRepository {}

Item _item(String id, {ItemStatus status = ItemStatus.ready}) => Item(
  (b) => b
    ..id = id
    ..url = 'https://x/$id'
    ..status = status
    ..readState = ReadState.unread
    ..favorite = false
    ..savedAt = DateTime.utc(2026),
);

void main() {
  late _MockRepo repo;
  setUp(() => repo = _MockRepo());

  blocTest<DetailCubit, DetailState>(
    'load emits loading → ready',
    build: () {
      when(() => repo.getItem('a')).thenAnswer((_) async => _item('a'));
      return DetailCubit(repo);
    },
    act: (c) => c.load('a'),
    expect: () => [
      isA<DetailState>().having(
        (s) => s.status,
        'status',
        DetailStatus.loading,
      ),
      isA<DetailState>().having((s) => s.status, 'status', DetailStatus.ready),
    ],
  );

  blocTest<DetailCubit, DetailState>(
    'load emits loading → error on failure',
    build: () {
      when(() => repo.getItem('a')).thenThrow(Exception('boom'));
      return DetailCubit(repo);
    },
    act: (c) => c.load('a'),
    expect: () => [
      isA<DetailState>().having(
        (s) => s.status,
        'status',
        DetailStatus.loading,
      ),
      isA<DetailState>().having((s) => s.status, 'status', DetailStatus.error),
    ],
  );

  blocTest<DetailCubit, DetailState>(
    'toggleFavorite updates the item',
    build: () {
      when(
        () => repo.updateItem('a', favorite: any(named: 'favorite')),
      ).thenAnswer((_) async => _item('a').rebuild((b) => b..favorite = true));
      return DetailCubit(repo);
    },
    seed: () => DetailState(status: DetailStatus.ready, item: _item('a')),
    act: (c) => c.toggleFavorite(),
    expect: () => [
      isA<DetailState>()
          .having((s) => s.status, 'status', DetailStatus.ready)
          .having((s) => s.item?.favorite, 'favorite', true),
    ],
  );
}
