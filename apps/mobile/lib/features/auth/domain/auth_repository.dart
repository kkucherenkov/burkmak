import 'package:app_mobile/features/auth/domain/auth_user.dart';

/// Result of a phone-OTP verification.
class VerifyOtpResult {
  const VerifyOtpResult({required this.user, required this.isNewUser});

  final AuthUser user;
  final bool isNewUser;
}

/// Port — auth operations.  Implementations live in `data/`.
abstract class AuthRepository {
  /// Authenticate with email + password. Returns the authenticated user.
  /// Throws on failure.
  Future<AuthUser> signIn({required String email, required String password});

  /// Register a new account. Returns the created user.
  /// Throws on failure.
  Future<AuthUser> signUp({
    required String name,
    required String email,
    required String password,
  });

  /// Sign out the current session; clears the stored bearer token.
  Future<void> signOut();

  /// Fetch the current session. Returns null when no valid session exists.
  Future<AuthUser?> getSession();

  /// Send a one-time code to the given phone number via SMS.
  /// Throws [OtpError] on failure.
  Future<void> requestOtp({required String phone});

  /// Verify a 6-digit OTP against the stored code and sign in (or sign up
  /// on first contact) with the derived email+password.
  /// Throws [OtpError] on failure.
  Future<VerifyOtpResult> verifyOtp({
    required String phone,
    required String code,
    required String name,
  });
}

enum OtpErrorKind { mismatch, expired, missing, invalid }

class OtpError implements Exception {
  const OtpError(this.kind);
  final OtpErrorKind kind;

  @override
  String toString() => 'OtpError(${kind.name})';
}
