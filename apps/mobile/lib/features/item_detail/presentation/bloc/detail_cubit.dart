import 'package:app_api_client/app_api_client.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app_mobile/features/item_detail/presentation/bloc/detail_state.dart';
import 'package:app_mobile/features/library/data/items_repository.dart';

class DetailCubit extends Cubit<DetailState> {
  DetailCubit(this._repo) : super(const DetailState());
  final ItemsRepository _repo;

  Future<void> load(String id) async {
    emit(state.copyWith(status: DetailStatus.loading, errorMessage: null));
    try {
      emit(
        state.copyWith(
          status: DetailStatus.ready,
          item: await _repo.getItem(id),
        ),
      );
    } on Object catch (e) {
      emit(
        state.copyWith(status: DetailStatus.error, errorMessage: e.toString()),
      );
    }
  }

  Future<void> setReadState(ReadState readState) async {
    final item = state.item;
    if (item == null) return;
    emit(
      state.copyWith(
        item: await _repo.updateItem(item.id, readState: readState),
      ),
    );
  }

  Future<void> toggleFavorite() async {
    final item = state.item;
    if (item == null) return;
    emit(
      state.copyWith(
        item: await _repo.updateItem(item.id, favorite: !item.favorite),
      ),
    );
  }

  Future<void> addTag(String tag) async {
    final item = state.item;
    if (item == null) return;
    emit(state.copyWith(item: await _repo.addTag(item.id, tag)));
  }

  Future<void> removeTag(String slug) async {
    final item = state.item;
    if (item == null) return;
    await _repo.removeTag(item.id, slug);
    emit(state.copyWith(item: await _repo.getItem(item.id)));
  }

  Future<void> delete() async {
    final item = state.item;
    if (item != null) await _repo.deleteItem(item.id);
  }
}
