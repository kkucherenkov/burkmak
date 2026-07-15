//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_shelf_request.g.dart';

/// CreateShelfRequest
///
/// Properties:
/// * [name] 
@BuiltValue()
abstract class CreateShelfRequest implements Built<CreateShelfRequest, CreateShelfRequestBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  CreateShelfRequest._();

  factory CreateShelfRequest([void updates(CreateShelfRequestBuilder b)]) = _$CreateShelfRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateShelfRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateShelfRequest> get serializer => _$CreateShelfRequestSerializer();
}

class _$CreateShelfRequestSerializer implements PrimitiveSerializer<CreateShelfRequest> {
  @override
  final Iterable<Type> types = const [CreateShelfRequest, _$CreateShelfRequest];

  @override
  final String wireName = r'CreateShelfRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateShelfRequest object, {
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
    CreateShelfRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateShelfRequestBuilder result,
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
  CreateShelfRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateShelfRequestBuilder();
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

