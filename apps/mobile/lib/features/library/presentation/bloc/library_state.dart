import 'package:equatable/equatable.dart';
import 'package:app_api_client/app_api_client.dart';

enum LibraryStatus { initial, loading, ready, error }

enum LibrarySegment { unread, read, archived, favorite }

class LibraryState extends Equatable {
  const LibraryState({
    this.status = LibraryStatus.initial,
    this.items = const [],
    this.segment = LibrarySegment.unread,
    this.query = '',
    this.tag,
    this.nextCursor,
    this.errorMessage,
  });

  final LibraryStatus status;
  final List<Item> items;
  final LibrarySegment segment;
  final String query;
  final String? tag;
  final String? nextCursor;
  final String? errorMessage;

  LibraryState copyWith({
    LibraryStatus? status,
    List<Item>? items,
    LibrarySegment? segment,
    String? query,
    String? tag,
    String? nextCursor,
    String? errorMessage,
  }) {
    return LibraryState(
      status: status ?? this.status,
      items: items ?? this.items,
      segment: segment ?? this.segment,
      query: query ?? this.query,
      tag: tag ?? this.tag,
      nextCursor: nextCursor,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [
    status,
    items,
    segment,
    query,
    tag,
    nextCursor,
    errorMessage,
  ];
}
