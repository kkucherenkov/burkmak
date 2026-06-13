import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_user.freezed.dart';
part 'auth_user.g.dart';

/// Domain entity representing an authenticated user's minimal profile.
/// Carries only the fields needed by the auth layer — the full profile
/// lives in `features/profile/`.
@freezed
abstract class AuthUser with _$AuthUser {
  const factory AuthUser({
    required String id,
    required String email,
    required String name,

    /// User role: 'client' | 'business' | 'admin'. Defaults to 'client' when the
    /// auth response does not include role metadata; the ProfileCubit provides
    /// the canonical value after full profile load.
    @Default('client') String role,
  }) = _AuthUser;

  factory AuthUser.fromJson(Map<String, dynamic> json) =>
      _$AuthUserFromJson(json);
}
