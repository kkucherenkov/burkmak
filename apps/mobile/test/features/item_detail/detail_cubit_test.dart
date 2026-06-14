import 'package:app_api_client/app_api_client.dart';
import 'package:app_mobile/features/item_detail/data/article_repository.dart';
import 'package:app_mobile/features/item_detail/presentation/bloc/detail_cubit.dart';
import 'package:app_mobile/features/item_detail/presentation/bloc/detail_state.dart';
import 'package:app_mobile/features/library/data/items_repository.dart';
import 'package:app_mobile/shared/network/events_client.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class _MockItemsRepo extends Mock implements ItemsRepository {}

class _MockArticleRepo extends Mock implements ArticleRepository {}

class _MockEvents extends Mock implements EventsClient {}

Item _item(
  String id, {
  ItemStatus status = ItemStatus.ready,
  ExtractStatus extractStatus = ExtractStatus.none,
}) => Item(
  (b) => b
    ..id = id
    ..url = 'https://x/$id'
    ..status = status
    ..extractStatus = extractStatus
    ..readState = ReadState.unread
    ..favorite = false
    ..savedAt = DateTime.utc(2026),
);

Article _article() => Article(
  (b) => b
    ..contentHtml = '<p>Hello world</p>'
    ..contentText = 'Hello world'
    ..wordCount = 2
    ..readingTimeMin = 1
    ..extractedAt = DateTime.utc(2026),
);

Highlight _highlight(String id, String itemId) => Highlight(
  (b) => b
    ..id = id
    ..itemId = itemId
    ..quote = 'Hello'
    ..prefix = ''
    ..suffix = ' world'
    ..color = HighlightColor.yellow
    ..createdAt = DateTime.utc(2026),
);

DetailCubit _buildCubit(
  _MockItemsRepo itemsRepo,
  _MockArticleRepo articleRepo,
  _MockEvents events,
) => DetailCubit(itemsRepo, articleRepo, events);

void main() {
  late _MockItemsRepo itemsRepo;
  late _MockArticleRepo articleRepo;
  late _MockEvents events;

  setUp(() {
    itemsRepo = _MockItemsRepo();
    articleRepo = _MockArticleRepo();
    events = _MockEvents();
    when(
      () => events.connect(),
    ).thenAnswer((_) => const Stream<AppEvent>.empty());
  });

  // ── Existing S1 tests ──────────────────────────────────────────────────

  blocTest<DetailCubit, DetailState>(
    'load emits loading → ready (extractStatus=none, no article)',
    build: () {
      when(() => itemsRepo.getItem('a')).thenAnswer((_) async => _item('a'));
      return _buildCubit(itemsRepo, articleRepo, events);
    },
    act: (c) => c.load('a'),
    expect: () => [
      isA<DetailState>().having(
        (s) => s.status,
        'status',
        DetailStatus.loading,
      ),
      isA<DetailState>()
          .having((s) => s.status, 'status', DetailStatus.ready)
          .having((s) => s.extractStatus, 'extractStatus', ExtractStatus.none),
    ],
  );

  blocTest<DetailCubit, DetailState>(
    'load emits loading → error on failure',
    build: () {
      when(() => itemsRepo.getItem('a')).thenThrow(Exception('boom'));
      return _buildCubit(itemsRepo, articleRepo, events);
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
        () => itemsRepo.updateItem('a', favorite: any(named: 'favorite')),
      ).thenAnswer((_) async => _item('a').rebuild((b) => b..favorite = true));
      return _buildCubit(itemsRepo, articleRepo, events);
    },
    seed: () => DetailState(status: DetailStatus.ready, item: _item('a')),
    act: (c) => c.toggleFavorite(),
    expect: () => [
      isA<DetailState>()
          .having((s) => s.status, 'status', DetailStatus.ready)
          .having((s) => s.item?.favorite, 'favorite', true),
    ],
  );

  // ── New S2 tests ───────────────────────────────────────────────────────

  blocTest<DetailCubit, DetailState>(
    'load fetches article + highlights when extractStatus=ready',
    build: () {
      when(
        () => itemsRepo.getItem('a'),
      ).thenAnswer((_) async => _item('a', extractStatus: ExtractStatus.ready));
      when(
        () => articleRepo.getArticle('a'),
      ).thenAnswer((_) async => _article());
      when(
        () => articleRepo.listHighlights('a'),
      ).thenAnswer((_) async => [_highlight('h1', 'a')]);
      return _buildCubit(itemsRepo, articleRepo, events);
    },
    act: (c) => c.load('a'),
    expect: () => [
      isA<DetailState>().having(
        (s) => s.status,
        'status',
        DetailStatus.loading,
      ),
      isA<DetailState>()
          .having((s) => s.status, 'status', DetailStatus.ready)
          .having((s) => s.extractStatus, 'extractStatus', ExtractStatus.ready)
          .having((s) => s.article, 'article', isNotNull)
          .having((s) => s.highlights.length, 'highlights', 1),
    ],
  );

  blocTest<DetailCubit, DetailState>(
    'extract() emits extractStatus=extracting',
    build: () {
      when(() => articleRepo.extract('a')).thenAnswer((_) async {});
      return _buildCubit(itemsRepo, articleRepo, events);
    },
    seed: () => DetailState(
      status: DetailStatus.ready,
      item: _item('a'),
      extractStatus: ExtractStatus.none,
    ),
    act: (c) => c.extract(),
    expect: () => [
      isA<DetailState>().having(
        (s) => s.extractStatus,
        'extractStatus',
        ExtractStatus.extracting,
      ),
    ],
  );

  // ── SSE negative-path guards ───────────────────────────────────────────

  blocTest<DetailCubit, DetailState>(
    'applyEvent ignores item.updated for a different id',
    build: () => _buildCubit(itemsRepo, articleRepo, events),
    seed: () => DetailState(status: DetailStatus.ready, item: _item('a')),
    act: (c) => c.applyEvent(const AppEvent(type: 'item.updated', id: 'b')),
    expect: () => <DetailState>[],
  );

  blocTest<DetailCubit, DetailState>(
    'applyEvent ignores non-update event type for the current id',
    build: () => _buildCubit(itemsRepo, articleRepo, events),
    seed: () => DetailState(status: DetailStatus.ready, item: _item('a')),
    act: (c) => c.applyEvent(const AppEvent(type: 'item.created', id: 'a')),
    expect: () => <DetailState>[],
  );

  blocTest<DetailCubit, DetailState>(
    'applyEvent(item.updated) with ready status fetches article + highlights',
    build: () {
      when(
        () => itemsRepo.getItem('a'),
      ).thenAnswer((_) async => _item('a', extractStatus: ExtractStatus.ready));
      when(
        () => articleRepo.getArticle('a'),
      ).thenAnswer((_) async => _article());
      when(
        () => articleRepo.listHighlights('a'),
      ).thenAnswer((_) async => [_highlight('h1', 'a')]);
      return _buildCubit(itemsRepo, articleRepo, events);
    },
    seed: () => DetailState(
      status: DetailStatus.ready,
      item: _item('a', extractStatus: ExtractStatus.extracting),
      extractStatus: ExtractStatus.extracting,
    ),
    act: (c) => c.applyEvent(const AppEvent(type: 'item.updated', id: 'a')),
    expect: () => [
      isA<DetailState>()
          .having((s) => s.extractStatus, 'extractStatus', ExtractStatus.ready)
          .having((s) => s.article, 'article', isNotNull)
          .having((s) => s.highlights.length, 'highlights', 1),
    ],
  );
}
