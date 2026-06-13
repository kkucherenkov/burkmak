import 'package:equatable/equatable.dart';

import 'package:app_mobile/features/auth/domain/auth_user.dart';

enum AuthStatus { unauthenticated, authenticating, authenticated, otpSent, error }

class AuthState extends Equatable {
  const AuthState({
    this.status = AuthStatus.unauthenticated,
    this.user,
    this.errorMessage,
    this.phone,
    this.devCode,
  });

  final AuthStatus status;
  final AuthUser? user;
  final String? errorMessage;
  final String? phone;

  /// Always empty since OTP is now handled server-side. Kept for schema
  /// stability; the dev banner in [SignInScreen] no longer renders a code.
  final String? devCode;

  AuthState copyWith({
    AuthStatus? status,
    AuthUser? user,
    String? errorMessage,
    String? phone,
    String? devCode,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
      phone: phone ?? this.phone,
      devCode: devCode ?? this.devCode,
    );
  }

  @override
  List<Object?> get props => [status, user, errorMessage, phone, devCode];
}
