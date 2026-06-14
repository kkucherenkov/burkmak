import 'dart:async';

import 'package:receive_sharing_intent/receive_sharing_intent.dart';

import 'package:app_mobile/app/routes.dart';
import 'package:app_mobile/shared/auth/token_storage.dart';
import 'package:app_mobile/shared/navigation/app_navigator.dart';
import 'package:app_mobile/shared/share/pending_share_store.dart';
import 'package:app_mobile/shared/share/share_url_parser.dart';

/// Listens for URLs shared into the app and routes them to the quick-save flow.
/// Signed in → push quick-save. Signed out → hold the URL for AuthGate.
class ShareIntentService {
  ShareIntentService(this._tokens, this._pending);

  final TokenStorage _tokens;
  final PendingShareStore _pending;
  StreamSubscription<List<SharedMediaFile>>? _sub;

  /// Call once after the first frame (navigator must exist).
  Future<void> start() async {
    final initial = await ReceiveSharingIntent.instance.getInitialMedia();
    _handle(initial);
    await ReceiveSharingIntent.instance.reset();

    _sub = ReceiveSharingIntent.instance.getMediaStream().listen(_handle);
  }

  Future<void> dispose() async {
    await _sub?.cancel();
  }

  Future<void> _handle(List<SharedMediaFile> media) async {
    if (media.isEmpty) return;
    final text = media
        .map((m) => m.path)
        .firstWhere((p) => extractFirstUrl(p) != null, orElse: () => '');
    final url = extractFirstUrl(text);
    if (url == null) return;

    final token = await _tokens.read();
    final signedIn = token != null && token.isNotEmpty;
    if (signedIn) {
      appNavigatorKey.currentState?.pushNamed(
        AppRoutes.quickSave,
        arguments: url,
      );
    } else {
      _pending.set(url);
    }
  }
}
