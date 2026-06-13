//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'add_tag_request.g.dart';

/// AddTagRequest
///
/// Properties:
/// * [tag] - Tag name or slug to add (created if absent)
@BuiltValue()
abstract class AddTagRequest implements Built<AddTagRequest, AddTagRequestBuilder> {
  /// Tag name or slug to add (created if absent)
  @BuiltValueField(wireName: r'tag')
  String get tag;

  AddTagRequest._();

  factory AddTagRequest([void updates(AddTagRequestBuilder b)]) = _$AddTagRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AddTagRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AddTagRequest> get serializer => _$AddTagRequestSerializer();
}

class _$AddTagRequestSerializer implements PrimitiveSerializer<AddTagRequest> {
  @override
  final Iterable<Type> types = const [AddTagRequest, _$AddTagRequest];

  @override
  final String wireName = r'AddTagRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AddTagRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'tag';
    yield serializers.serialize(
      object.tag,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AddTagRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AddTagRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'tag':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.tag = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AddTagRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AddTagRequestBuilder();
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

