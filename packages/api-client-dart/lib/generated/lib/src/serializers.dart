//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_import

import 'package:one_of_serializer/any_of_serializer.dart';
import 'package:one_of_serializer/one_of_serializer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/serializer.dart';
import 'package:built_value/standard_json_plugin.dart';
import 'package:built_value/iso_8601_date_time_serializer.dart';
import 'package:app_api_client/src/date_serializer.dart';
import 'package:app_api_client/src/model/date.dart';

import 'package:app_api_client/src/model/add_tag_request.dart';
import 'package:app_api_client/src/model/article.dart';
import 'package:app_api_client/src/model/create_highlight_request.dart';
import 'package:app_api_client/src/model/dependency_status.dart';
import 'package:app_api_client/src/model/extract_accepted.dart';
import 'package:app_api_client/src/model/extract_status.dart';
import 'package:app_api_client/src/model/health_status.dart';
import 'package:app_api_client/src/model/health_status_dependencies.dart';
import 'package:app_api_client/src/model/highlight.dart';
import 'package:app_api_client/src/model/highlight_color.dart';
import 'package:app_api_client/src/model/highlight_list.dart';
import 'package:app_api_client/src/model/item.dart';
import 'package:app_api_client/src/model/item_list.dart';
import 'package:app_api_client/src/model/item_status.dart';
import 'package:app_api_client/src/model/problem.dart';
import 'package:app_api_client/src/model/read_state.dart';
import 'package:app_api_client/src/model/rename_tag_request.dart';
import 'package:app_api_client/src/model/save_item_request.dart';
import 'package:app_api_client/src/model/tag.dart';
import 'package:app_api_client/src/model/tag_list.dart';
import 'package:app_api_client/src/model/update_highlight_request.dart';
import 'package:app_api_client/src/model/update_item_request.dart';

part 'serializers.g.dart';

@SerializersFor([
  AddTagRequest,
  Article,
  CreateHighlightRequest,
  DependencyStatus,
  ExtractAccepted,
  ExtractStatus,
  HealthStatus,
  HealthStatusDependencies,
  Highlight,
  HighlightColor,
  HighlightList,
  Item,
  ItemList,
  ItemStatus,
  Problem,
  ReadState,
  RenameTagRequest,
  SaveItemRequest,
  Tag,
  TagList,
  UpdateHighlightRequest,
  UpdateItemRequest,
])
Serializers serializers = (_$serializers.toBuilder()
      ..add(const OneOfSerializer())
      ..add(const AnyOfSerializer())
      ..add(const DateSerializer())
      ..add(Iso8601DateTimeSerializer())
    ).build();

Serializers standardSerializers =
    (serializers.toBuilder()..addPlugin(StandardJsonPlugin())).build();
