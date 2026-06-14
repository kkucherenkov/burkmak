import 'package:equatable/equatable.dart';

enum AddLinkStatus { idle, saving, saved, error }

class AddLinkState extends Equatable {
  const AddLinkState({this.status = AddLinkStatus.idle, this.errorMessage});

  final AddLinkStatus status;
  final String? errorMessage;

  AddLinkState copyWith({AddLinkStatus? status, String? errorMessage}) {
    return AddLinkState(
      status: status ?? this.status,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, errorMessage];
}
