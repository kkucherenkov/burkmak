import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';

class AppEvent {
  const AppEvent({required this.type, this.id});
  final String type;
  final String? id;

  static AppEvent? fromEnvelope(String json) {
    try {
      final map = jsonDecode(json) as Map<String, dynamic>;
      final type = map['type'] as String?;
      if (type == null) return null;
      final data = map['data'] as Map<String, dynamic>?;
      return AppEvent(type: type, id: data?['id'] as String?);
    } on Object {
      // SSE payloads come from the network and may be malformed; skip bad lines
      // rather than crashing the stream.
      return null;
    }
  }
}

class EventsClient {
  EventsClient(this._dio);
  final Dio _dio;

  /// Opens the SSE stream. Re-call to reconnect.
  Stream<AppEvent> connect() async* {
    final response = await _dio.get<ResponseBody>(
      '/events',
      options: Options(
        responseType: ResponseType.stream,
        headers: {'Accept': 'text/event-stream'},
      ),
    );
    final lines = response.data!.stream
        .cast<List<int>>()
        .transform(utf8.decoder)
        .transform(const LineSplitter());
    await for (final line in lines) {
      if (!line.startsWith('data:')) continue; // skip heartbeats / comments
      final payload = line.substring(5).trim();
      if (payload.isEmpty) continue;
      final event = AppEvent.fromEnvelope(payload);
      if (event != null) yield event;
    }
  }
}
