import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app_mobile/features/add_link/presentation/bloc/add_link_state.dart';
import 'package:app_mobile/features/library/data/items_repository.dart';

class AddLinkCubit extends Cubit<AddLinkState> {
  AddLinkCubit(this._repo) : super(const AddLinkState());
  final ItemsRepository _repo;

  Future<void> save(String url) async {
    emit(state.copyWith(status: AddLinkStatus.saving, errorMessage: null));
    try {
      await _repo.saveItem(url);
      emit(state.copyWith(status: AddLinkStatus.saved));
    } on Object catch (e) {
      emit(
        state.copyWith(status: AddLinkStatus.error, errorMessage: e.toString()),
      );
    }
  }
}
