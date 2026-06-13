import 'package:dio/dio.dart';

import 'package:app_mobile/features/auth/domain/auth_repository.dart';
import 'package:app_mobile/features/auth/domain/auth_user.dart';
import 'package:app_mobile/shared/auth/token_storage.dart';

/// Implements [AuthRepository] by calling Better Auth endpoints directly via
/// Dio.  Better Auth owns its own wire format and is not part of the generated
/// `app_api_client`, so we call the endpoints manually here.
///
/// Endpoint base: `/api/v1/auth/` — our namespace prefix keeps all routes
/// under the versioned API path.
///
/// Phone + OTP is handled by the Better Auth `phoneNumber` plugin on the
/// backend:
///   POST /api/v1/auth/phone-number/send-otp   — triggers SMS delivery
///   POST /api/v1/auth/phone-number/verify-otp — validates code, returns token
class AuthApiImpl implements AuthRepository {
  AuthApiImpl({required Dio dio, required TokenStorage tokenStorage})
      : _dio = dio,
        _tokenStorage = tokenStorage;

  final Dio _dio;
  final TokenStorage _tokenStorage;

  @override
  Future<AuthUser> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/api/v1/auth/sign-in/email',
      data: {'email': email, 'password': password},
    );
    return _handleAuthResponse(response.data);
  }

  @override
  Future<AuthUser> signUp({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/api/v1/auth/sign-up/email',
      data: {'name': name, 'email': email, 'password': password},
    );
    return _handleAuthResponse(response.data);
  }

  @override
  Future<void> signOut() async {
    try {
      await _dio.post<void>('/api/v1/auth/sign-out');
    } finally {
      await _tokenStorage.clear();
    }
  }

  @override
  Future<AuthUser?> getSession() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/v1/auth/get-session',
      );
      final data = response.data;
      if (data == null) return null;
      final user = data['user'];
      if (user == null) return null;
      return AuthUser(
        id: user['id'] as String,
        email: user['email'] as String,
        name: (user['name'] as String?) ?? '',
        role: (user['role'] as String?) ?? 'client',
      );
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) return null;
      rethrow;
    }
  }

  @override
  Future<void> requestOtp({required String phone}) async {
    final digits = _normalisePhone(phone);
    final phoneE164 = '+$digits';
    try {
      await _dio.post<void>(
        '/api/v1/auth/phone-number/send-otp',
        data: {'phoneNumber': phoneE164},
      );
    } on DioException catch (e) {
      final statusCode = e.response?.statusCode ?? 0;
      if (statusCode == 400) throw const OtpError(OtpErrorKind.invalid);
      rethrow;
    }
  }

  @override
  Future<VerifyOtpResult> verifyOtp({
    required String phone,
    required String code,
    required String name,
  }) async {
    final digits = _normalisePhone(phone);
    final phoneE164 = '+$digits';
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/v1/auth/phone-number/verify-otp',
        data: {'phoneNumber': phoneE164, 'code': code},
      );
      return _handleOtpResponse(response.data);
    } on DioException catch (e) {
      final statusCode = e.response?.statusCode ?? 0;
      if (statusCode == 400) throw const OtpError(OtpErrorKind.mismatch);
      if (statusCode == 410) throw const OtpError(OtpErrorKind.expired);
      rethrow;
    }
  }

  VerifyOtpResult _handleOtpResponse(Map<String, dynamic>? data) {
    if (data == null) throw Exception('Empty verify-otp response');
    final token = data['token'] as String?;
    if (token != null && token.isNotEmpty) {
      _tokenStorage.write(token);
    }
    final userData = data['user'] as Map<String, dynamic>?;
    if (userData == null) throw Exception('No user in verify-otp response');
    return VerifyOtpResult(
      user: AuthUser(
        id: userData['id'] as String,
        email: (userData['email'] as String?) ?? '',
        name: (userData['name'] as String?) ?? '',
        role: (userData['role'] as String?) ?? 'client',
      ),
      isNewUser: false,
    );
  }

  AuthUser _handleAuthResponse(Map<String, dynamic>? data) {
    if (data == null) throw Exception('Empty auth response');
    final token = data['token'] as String?;
    if (token != null && token.isNotEmpty) {
      // Fire-and-forget token persistence; Dio interceptor will pick it up
      // for subsequent requests.
      _tokenStorage.write(token);
    }
    final user = data['user'] as Map<String, dynamic>?;
    if (user == null) throw Exception('No user in auth response');
    return AuthUser(
      id: user['id'] as String,
      email: user['email'] as String,
      name: (user['name'] as String?) ?? '',
      role: (user['role'] as String?) ?? 'client',
    );
  }

  String _normalisePhone(String raw) {
    final digits = raw.replaceAll(RegExp(r'\D+'), '');
    if (digits.length < 6) {
      throw const OtpError(OtpErrorKind.invalid);
    }
    return digits;
  }
}
