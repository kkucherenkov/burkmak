import 'package:app_api_client/app_api_client.dart';
import 'package:equatable/equatable.dart';

enum DetailStatus { loading, ready, error }

class DetailState extends Equatable {
  const DetailState({
    this.status = DetailStatus.loading,
    this.item,
    this.errorMessage,
    this.extractStatus = ExtractStatus.none,
    this.article,
    this.highlights = const [],
  });

  final DetailStatus status;
  final Item? item;
  final String? errorMessage;

  /// Mirrors the item's `extractStatus` field, kept in state for convenience.
  final ExtractStatus extractStatus;

  /// Non-null only when [extractStatus] == [ExtractStatus.ready].
  final Article? article;

  /// Read-only highlights for the current item. Empty until loaded.
  final List<Highlight> highlights;

  DetailState copyWith({
    DetailStatus? status,
    Item? item,
    String? errorMessage,
    ExtractStatus? extractStatus,
    Article? article,
    List<Highlight>? highlights,
  }) {
    return DetailState(
      status: status ?? this.status,
      item: item ?? this.item,
      errorMessage: errorMessage,
      extractStatus: extractStatus ?? this.extractStatus,
      article: article ?? this.article,
      highlights: highlights ?? this.highlights,
    );
  }

  @override
  List<Object?> get props => [
    status,
    item,
    errorMessage,
    extractStatus,
    article,
    highlights,
  ];
}
