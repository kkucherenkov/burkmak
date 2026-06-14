import 'package:app_api_client/app_api_client.dart';
import 'package:app_mobile/features/add_link/presentation/bloc/add_link_cubit.dart';
import 'package:app_mobile/features/add_link/presentation/bloc/add_link_state.dart';
import 'package:app_mobile/features/library/data/items_repository.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class _MockRepo extends Mock implements ItemsRepository {}

Item _item(String id) => Item(
  (b) => b
    ..id = id
    ..url = 'https://x/$id'
    ..status = ItemStatus.pending
    ..readState = ReadState.unread
    ..favorite = false
    ..savedAt = DateTime.utc(2026),
);

void main() {
  late _MockRepo repo;
  setUp(() => repo = _MockRepo());

  blocTest<AddLinkCubit, AddLinkState>(
    'save emits saving → saved',
    build: () {
      when(() => repo.saveItem(any())).thenAnswer((_) async => _item('a'));
      return AddLinkCubit(repo);
    },
    act: (c) => c.save('https://x.com'),
    expect: () => [
      isA<AddLinkState>().having(
        (s) => s.status,
        'status',
        AddLinkStatus.saving,
      ),
      isA<AddLinkState>().having(
        (s) => s.status,
        'status',
        AddLinkStatus.saved,
      ),
    ],
  );

  blocTest<AddLinkCubit, AddLinkState>(
    'save emits saving → error on failure',
    build: () {
      when(() => repo.saveItem(any())).thenThrow(Exception('boom'));
      return AddLinkCubit(repo);
    },
    act: (c) => c.save('https://x.com'),
    expect: () => [
      isA<AddLinkState>().having(
        (s) => s.status,
        'status',
        AddLinkStatus.saving,
      ),
      isA<AddLinkState>().having(
        (s) => s.status,
        'status',
        AddLinkStatus.error,
      ),
    ],
  );
}
