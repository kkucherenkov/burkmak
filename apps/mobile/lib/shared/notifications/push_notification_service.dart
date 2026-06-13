import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

/// Handles FCM token retrieval, permission requests, and foreground message
/// handling. Background messages are processed by the static handler
/// [_onBackgroundMessage] registered before runApp().
class PushNotificationService {
  PushNotificationService(this._messaging);

  final FirebaseMessaging _messaging;

  /// Must be called before [runApp] to wire the background handler.
  static Future<void> registerBackgroundHandler() async {
    FirebaseMessaging.onBackgroundMessage(_onBackgroundMessage);
  }

  /// Requests permission (iOS / web) and returns the current FCM token.
  /// Returns null if permission is denied or token is unavailable.
  Future<String?> initialise() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      return null;
    }

    final token = await _messaging.getToken();

    // Listen for foreground messages — show in-app banner or dispatch to BLoC.
    FirebaseMessaging.onMessage.listen(_handleForeground);

    // Token refresh — caller should re-register with the backend.
    _messaging.onTokenRefresh.listen(_handleTokenRefresh);

    return token;
  }

  void _handleForeground(RemoteMessage message) {
    debugPrint('[FCM] Foreground: ${message.notification?.title}');
  }

  void _handleTokenRefresh(String token) {
    debugPrint('[FCM] Token refreshed');
    // TODO: re-register new token via PUT /api/v1/me/fcm-token
  }
}

@pragma('vm:entry-point')
Future<void> _onBackgroundMessage(RemoteMessage message) async {
  debugPrint('[FCM] Background: ${message.notification?.title}');
}
