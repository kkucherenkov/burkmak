//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'rename_tag_request.g.dart';

/// RenameTagRequest
///
/// Properties:
/// * [name] - New display name for the tag
@BuiltValue()
abstract class RenameTagRequest implements Built<RenameTagRequest, RenameTagRequestBuilder> {
  /// New display name for the tag
  @BuiltValueField(wireName: r'name')
  String get name;

  RenameTagRequest._();

  factory RenameTagRequest([void updates(RenameTagRequestBuilder b)]) = _$RenameTagRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RenameTagRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RenameTagRequest> get serializer => _$RenameTagRequestSerializer();
}

class _$RenameTagRequestSerializer implements PrimitiveSerializer<RenameTagRequest> {
  @override
  final Iterable<Type> types = const [RenameTagRequest, _$RenameTagRequest];

  @override
  final String wireName = r'RenameTagRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RenameTagRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RenameTagRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RenameTagRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RenameTagRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RenameTagRequestBuilder();
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

