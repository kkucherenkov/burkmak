//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'personal_access_token.g.dart';

/// A personal access token record (secret and hash are never returned).
///
/// Properties:
/// * [id] - Unique token ID (cuid)
/// * [name] - Human-readable label assigned at creation
/// * [prefix] - First ~12 characters of the token for visual identification (e.g. \"burk_pat_ab12\")
/// * [lastUsedAt] - ISO-8601 timestamp of the most recent successful use; null if never used
/// * [createdAt] - ISO-8601 timestamp when the token was created
@BuiltValue()
abstract class PersonalAccessToken implements Built<PersonalAccessToken, PersonalAccessTokenBuilder> {
  /// Unique token ID (cuid)
  @BuiltValueField(wireName: r'id')
  String get id;

  /// Human-readable label assigned at creation
  @BuiltValueField(wireName: r'name')
  String get name;

  /// First ~12 characters of the token for visual identification (e.g. \"burk_pat_ab12\")
  @BuiltValueField(wireName: r'prefix')
  String get prefix;

  /// ISO-8601 timestamp of the most recent successful use; null if never used
  @BuiltValueField(wireName: r'lastUsedAt')
  DateTime? get lastUsedAt;

  /// ISO-8601 timestamp when the token was created
  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  PersonalAccessToken._();

  factory PersonalAccessToken([void updates(PersonalAccessTokenBuilder b)]) = _$PersonalAccessToken;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PersonalAccessTokenBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PersonalAccessToken> get serializer => _$PersonalAccessTokenSerializer();
}

class _$PersonalAccessTokenSerializer implements PrimitiveSerializer<PersonalAccessToken> {
  @override
  final Iterable<Type> types = const [PersonalAccessToken, _$PersonalAccessToken];

  @override
  final String wireName = r'PersonalAccessToken';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PersonalAccessToken object, {
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
    if (object.lastUsedAt != null) {
      yield r'lastUsedAt';
      yield serializers.serialize(
        object.lastUsedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PersonalAccessToken object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PersonalAccessTokenBuilder result,
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
        case r'lastUsedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.lastUsedAt = valueDes;
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
  PersonalAccessToken deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PersonalAccessTokenBuilder();
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

