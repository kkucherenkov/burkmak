//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_token_request.g.dart';

/// CreateTokenRequest
///
/// Properties:
/// * [name] - Human-readable label for this token (e.g. \"Kobo e-reader\")
@BuiltValue()
abstract class CreateTokenRequest implements Built<CreateTokenRequest, CreateTokenRequestBuilder> {
  /// Human-readable label for this token (e.g. \"Kobo e-reader\")
  @BuiltValueField(wireName: r'name')
  String get name;

  CreateTokenRequest._();

  factory CreateTokenRequest([void updates(CreateTokenRequestBuilder b)]) = _$CreateTokenRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateTokenRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateTokenRequest> get serializer => _$CreateTokenRequestSerializer();
}

class _$CreateTokenRequestSerializer implements PrimitiveSerializer<CreateTokenRequest> {
  @override
  final Iterable<Type> types = const [CreateTokenRequest, _$CreateTokenRequest];

  @override
  final String wireName = r'CreateTokenRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateTokenRequest object, {
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
    CreateTokenRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateTokenRequestBuilder result,
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
  CreateTokenRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateTokenRequestBuilder();
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

