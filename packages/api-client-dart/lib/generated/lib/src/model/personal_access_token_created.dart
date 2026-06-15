//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'personal_access_token_created.g.dart';

/// Response body returned when a personal access token is created (201). The `token` field contains the full plaintext secret — it is returned exactly once and cannot be retrieved again. 
///
/// Properties:
/// * [id] - Unique token ID (cuid)
/// * [name] - Human-readable label
/// * [prefix] - First ~12 characters for visual identification
/// * [token] - Full plaintext token (`burk_pat_` + 43 base64url chars). Store this value securely — it will not be shown again. 
/// * [createdAt] - ISO-8601 timestamp when the token was created
@BuiltValue()
abstract class PersonalAccessTokenCreated implements Built<PersonalAccessTokenCreated, PersonalAccessTokenCreatedBuilder> {
  /// Unique token ID (cuid)
  @BuiltValueField(wireName: r'id')
  String get id;

  /// Human-readable label
  @BuiltValueField(wireName: r'name')
  String get name;

  /// First ~12 characters for visual identification
  @BuiltValueField(wireName: r'prefix')
  String get prefix;

  /// Full plaintext token (`burk_pat_` + 43 base64url chars). Store this value securely — it will not be shown again. 
  @BuiltValueField(wireName: r'token')
  String get token;

  /// ISO-8601 timestamp when the token was created
  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  PersonalAccessTokenCreated._();

  factory PersonalAccessTokenCreated([void updates(PersonalAccessTokenCreatedBuilder b)]) = _$PersonalAccessTokenCreated;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PersonalAccessTokenCreatedBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PersonalAccessTokenCreated> get serializer => _$PersonalAccessTokenCreatedSerializer();
}

class _$PersonalAccessTokenCreatedSerializer implements PrimitiveSerializer<PersonalAccessTokenCreated> {
  @override
  final Iterable<Type> types = const [PersonalAccessTokenCreated, _$PersonalAccessTokenCreated];

  @override
  final String wireName = r'PersonalAccessTokenCreated';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PersonalAccessTokenCreated object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'prefix';
    yield serializers.serialize(
      object.prefix,
      specifiedType: const FullType(String),
    );
    yield r'token';
    yield serializers.serialize(
      object.token,
      specifiedType: const FullType(String),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PersonalAccessTokenCreated object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PersonalAccessTokenCreatedBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'prefix':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.prefix = valueDes;
          break;
        case r'token':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.token = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PersonalAccessTokenCreated deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PersonalAccessTokenCreatedBuilder();
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

