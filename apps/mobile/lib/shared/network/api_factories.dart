import 'package:dio/dio.dart';

/// Thin factory functions that wire the generated API classes to the shared
/// [Dio] instance registered in get_it.
///
/// Once `pnpm spec:codegen` runs and `packages/api-client-dart` is populated,
/// import the generated barrel and add factory functions here. Example:
///
/// ```dart
/// import 'package:app_api_client/app_api_client.dart';
///
/// ProfileApi buildProfileApi(Dio dio) => ProfileApi(dio, standardSerializers);
/// ```
///
/// Then register in [configureDependencies]:
///
/// ```dart
/// getIt.registerLazySingleton<ProfileApi>(() => buildProfileApi(getIt<Dio>()));
/// ```
///
/// Auth uses Dio directly and does not need a factory here.

// ignore: unused_element
Dio _placeholderDio(Dio dio) => dio;
