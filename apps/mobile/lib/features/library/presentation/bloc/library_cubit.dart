import 'dart:async';

import 'package:app_api_client/app_api_client.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app_mobile/features/library/data/items_repository.dart';
import 'package:app_mobile/features/library/presentation/bloc/library_state.dart';
import 'package:app_mobile/shared/network/events_client.dart';

class LibraryCubit extends Cubit<LibraryState> {
  LibraryCubit(this._repo, this._events) : super(const LibraryState());

  final ItemsRepository _repo;
  final EventsClient _events;
  StreamSubscription<AppEvent>? _sub;

  ReadState? _readStateFor(LibrarySegment s) => switch (s) {
    LibrarySegment.unread => ReadState.unread,
    LibrarySegment.read => ReadState.read,
    LibrarySegment.archived => ReadState.archived,
    LibrarySegment.favorite => null,
  };

  Future<void> load() async {
    emit(state.copyWith(status: LibraryStatus.loading, errorMessage: null));
    try {
      final page = await _repo.listItems(
        readState: _readStateFor(state.segment),
        favorite: state.segment == LibrarySegment.favorite ? true : null,
        tag: state.tag,
        q: state.query.isEmpty ? null : state.query,
      );
      emit(
        state.copyWith(
          status: LibraryStatus.ready,
          items: page.items.toList(),
          nextCursor: page.nextCursor,
        ),
      );
    } on Object catch (e) {
      emit(
        state.copyWith(status: LibraryStatus.error, errorMessage: e.toString()),
      );
    }
  }

  Future<void> loadMore() async {
    final cursor = state.nextCursor;
    if (cursor == null) return;
    final page = await _repo.listItems(
      readState: _readStateFor(state.segment),
      favorite: state.segment == LibrarySegment.favorite ? true : null,
      tag: state.tag,
      q: state.query.isEmpty ? null : state.query,
      cursor: cursor,
    );
    emit(
      state.copyWith(
        items: [...state.items, ...page.items],
        nextCursor: page.nextCursor,
      ),
    );
  }

  void setSegment(LibrarySegment segment) {
    emit(state.copyWith(segment: segment));
    load();
  }

  void setQuery(String query) {
    emit(state.copyWith(query: query));
    load();
  }

  void setTag(String? tag) {
    emit(state.copyWith(tag: tag));
    load();
  }

  Future<void> save(String url) async {
    await _repo.saveItem(url);
  }

  Future<void> toggleFavorite(Item item) async {
    await _repo.updateItem(item.id, favorite: !item.favorite);
  }

  Future<void> setReadState(Item item, ReadState readState) async {
    await _repo.updateItem(item.id, readState: readState);
  }

  Future<void> remove(String id) async {
    emit(state.copyWith(items: state.items.where((i) => i.id != id).toList()));
    await _repo.deleteItem(id);
  }

  void subscribe() {
    _sub ??= _events.connect().listen(applyEvent);
  }

  Future<void> applyEvent(AppEvent e) async {
    final id = e.id;
    if (id == null) return;
    switch (e.type) {
      case 'item.created':
      case 'item.updated':
        final fresh = await _repo.getItem(id);
        final idx = state.items.indexWhere((i) => i.id == id);
        final next = [...state.items];
        if (idx == -1) {
          next.insert(0, fresh);
        } else {
          next[idx] = fresh;
        }
        emit(state.copyWith(items: next));
      case 'item.deleted':
        emit(
          state.copyWith(items: state.items.where((i) => i.id != id).toList()),
        );
    }
  }

  @override
  Future<void> close() {
    _sub?.cancel();
    return super.close();
  }
}
