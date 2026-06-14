import 'dart:async';

import 'package:app_api_client/app_api_client.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app_mobile/features/item_detail/data/article_repository.dart';
import 'package:app_mobile/features/item_detail/presentation/bloc/detail_state.dart';
import 'package:app_mobile/features/library/data/items_repository.dart';
import 'package:app_mobile/shared/network/events_client.dart';

class DetailCubit extends Cubit<DetailState> {
  DetailCubit(this._itemsRepo, this._articleRepo, this._events)
    : super(const DetailState());

  final ItemsRepository _itemsRepo;
  final ArticleRepository _articleRepo;
  final EventsClient _events;

  String? _currentId;
  StreamSubscription<AppEvent>? _sub;

  /// Loads the item by [id]. If the item is already extracted, also fetches
  /// the article HTML and highlights.
  Future<void> load(String id) async {
    _currentId = id;
    emit(state.copyWith(status: DetailStatus.loading, errorMessage: null));
    try {
      final item = await _itemsRepo.getItem(id);
      if (item.extractStatus == ExtractStatus.ready) {
        final results = await Future.wait([
          _articleRepo.getArticle(id),
          _articleRepo.listHighlights(id),
        ]);
        emit(
          state.copyWith(
            status: DetailStatus.ready,
            item: item,
            extractStatus: item.extractStatus,
            article: results[0] as Article,
            highlights: results[1] as List<Highlight>,
          ),
        );
      } else {
        emit(
          state.copyWith(
            status: DetailStatus.ready,
            item: item,
            extractStatus: item.extractStatus,
          ),
        );
      }
    } on Object catch (e) {
      emit(
        state.copyWith(status: DetailStatus.error, errorMessage: e.toString()),
      );
    }
  }

  /// Triggers article extraction. Emits [ExtractStatus.extracting] immediately.
  Future<void> extract() async {
    final id = _currentId ?? state.item?.id;
    if (id == null) return;
    emit(state.copyWith(extractStatus: ExtractStatus.extracting));
    try {
      await _articleRepo.extract(id);
    } on Object catch (_) {
      emit(state.copyWith(extractStatus: ExtractStatus.failed));
    }
  }

  /// Subscribes to the SSE stream, applying events for the current item.
  void subscribe() {
    _sub ??= _events.connect().listen(applyEvent);
  }

  /// Handles an SSE event. On `item.updated` for the current item, re-fetches
  /// the item and, if now ready, loads the article + highlights.
  Future<void> applyEvent(AppEvent event) async {
    final id = event.id;
    if (id == null || id != (_currentId ?? state.item?.id)) return;
    if (event.type != 'item.updated') return;

    try {
      final item = await _itemsRepo.getItem(id);
      if (item.extractStatus == ExtractStatus.ready) {
        final results = await Future.wait([
          _articleRepo.getArticle(id),
          _articleRepo.listHighlights(id),
        ]);
        emit(
          state.copyWith(
            item: item,
            extractStatus: ExtractStatus.ready,
            article: results[0] as Article,
            highlights: results[1] as List<Highlight>,
          ),
        );
      } else {
        emit(state.copyWith(item: item, extractStatus: item.extractStatus));
      }
    } on Object catch (_) {
      // Transient refetch failure during an SSE update: keep the article that
      // is already on screen. Only the initial load() path should surface an
      // error state to the UI.
    }
  }

  // ── Existing S1 operations ─────────────────────────────────────────────

  Future<void> setReadState(ReadState readState) async {
    final item = state.item;
    if (item == null) return;
    emit(
      state.copyWith(
        item: await _itemsRepo.updateItem(item.id, readState: readState),
      ),
    );
  }

  Future<void> toggleFavorite() async {
    final item = state.item;
    if (item == null) return;
    emit(
      state.copyWith(
        item: await _itemsRepo.updateItem(item.id, favorite: !item.favorite),
      ),
    );
  }

  Future<void> addTag(String tag) async {
    final item = state.item;
    if (item == null) return;
    emit(state.copyWith(item: await _itemsRepo.addTag(item.id, tag)));
  }

  Future<void> removeTag(String slug) async {
    final item = state.item;
    if (item == null) return;
    await _itemsRepo.removeTag(item.id, slug);
    emit(state.copyWith(item: await _itemsRepo.getItem(item.id)));
  }

  Future<void> delete() async {
    final item = state.item;
    if (item != null) await _itemsRepo.deleteItem(item.id);
  }

  @override
  Future<void> close() {
    _sub?.cancel();
    return super.close();
  }
}
