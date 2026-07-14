//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:app_api_client/src/model/kind.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'save_item_request.g.dart';

/// SaveItemRequest
///
/// Properties:
/// * [url] - URL to save
/// * [tags] - Optional tag slugs to attach immediately
/// * [kind] - Save as a readable article (default) or a reference bookmark
@BuiltValue()
abstract class SaveItemRequest implements Built<SaveItemRequest, SaveItemRequestBuilder> {
  /// URL to save
  @BuiltValueField(wireName: r'url')
  String get url;

  /// Optional tag slugs to attach immediately
  @BuiltValueField(wireName: r'tags')
  BuiltList<String>? get tags;

  /// Save as a readable article (default) or a reference bookmark
  @BuiltValueField(wireName: r'kind')
  Kind? get kind;
  // enum kindEnum {  article,  bookmark,  };

  SaveItemRequest._();

  factory SaveItemRequest([void updates(SaveItemRequestBuilder b)]) = _$SaveItemRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SaveItemRequestBuilder b) => b
      ..kind = Kind.article;

  @BuiltValueSerializer(custom: true)
  static Serializer<SaveItemRequest> get serializer => _$SaveItemRequestSerializer();
}

class _$SaveItemRequestSerializer implements PrimitiveSerializer<SaveItemRequest> {
  @override
  final Iterable<Type> types = const [SaveItemRequest, _$SaveItemRequest];

  @override
  final String wireName = r'SaveItemRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SaveItemRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'url';
    yield serializers.serialize(
      object.url,
      specifiedType: const FullType(String),
    );
    if (object.tags != null) {
      yield r'tags';
      yield serializers.serialize(
        object.tags,
        specifiedType: const FullType(BuiltList, [FullType(String)]),
      );
    }
    if (object.kind != null) {
      yield r'kind';
      yield serializers.serialize(
        object.kind,
        specifiedType: const FullType(Kind),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    SaveItemRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SaveItemRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'url':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.url = valueDes;
          break;
        case r'tags':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.tags.replace(valueDes);
          break;
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Kind),
          ) as Kind;
          result.kind = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SaveItemRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SaveItemRequestBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

