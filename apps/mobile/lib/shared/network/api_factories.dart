import 'package:app_api_client/app_api_client.dart';
import 'package:dio/dio.dart';

/// Thin factory functions that wire the generated API classes to the shared
/// [Dio] instance registered in get_it.
///
/// Both constructors take `(Dio, Serializers)` — we pass [standardSerializers]
/// which includes the [StandardJsonPlugin] registered in the generated barrel.
ItemsApi buildItemsApi(Dio dio) => ItemsApi(dio, standardSerializers);

TagsApi buildTagsApi(Dio dio) => TagsApi(dio, standardSerializers);
