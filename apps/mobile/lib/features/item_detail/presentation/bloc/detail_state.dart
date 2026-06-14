import 'package:equatable/equatable.dart';
import 'package:app_api_client/app_api_client.dart';

enum DetailStatus { loading, ready, error }

class DetailState extends Equatable {
  const DetailState({
    this.status = DetailStatus.loading,
    this.item,
    this.errorMessage,
  });

  final DetailStatus status;
  final Item? item;
  final String? errorMessage;

  DetailState copyWith({
    DetailStatus? status,
    Item? item,
    String? errorMessage,
  }) {
    return DetailState(
      status: status ?? this.status,
      item: item ?? this.item,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, item, errorMessage];
}
