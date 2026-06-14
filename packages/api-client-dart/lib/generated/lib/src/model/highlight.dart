//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:app_api_client/src/model/highlight_color.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'highlight.g.dart';

/// Highlight
///
/// Properties:
/// * [id] - Unique highlight ID (cuid)
/// * [itemId] - ID of the item this highlight belongs to (cuid)
/// * [quote] - The exact text that was highlighted
/// * [prefix] - Short text immediately before the highlighted quote (for anchor context)
/// * [suffix] - Short text immediately after the highlighted quote (for anchor context)
/// * [note] - Optional reader note attached to the highlight
/// * [color] 
/// * [createdAt] - ISO-8601 timestamp when the highlight was created
@BuiltValue()
abstract class Highlight implements Built<Highlight, HighlightBuilder> {
  /// Unique highlight ID (cuid)
  @BuiltValueField(wireName: r'id')
  String get id;

  /// ID of the item this highlight belongs to (cuid)
  @BuiltValueField(wireName: r'itemId')
  String get itemId;

  /// The exact text that was highlighted
  @BuiltValueField(wireName: r'quote')
  String get quote;

  /// Short text immediately before the highlighted quote (for anchor context)
  @BuiltValueField(wireName: r'prefix')
  String get prefix;

  /// Short text immediately after the highlighted quote (for anchor context)
  @BuiltValueField(wireName: r'suffix')
  String get suffix;

  /// Optional reader note attached to the highlight
  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'color')
  HighlightColor get color;
  // enum colorEnum {  yellow,  green,  blue,  pink,  };

  /// ISO-8601 timestamp when the highlight was created
  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  Highlight._();

  factory Highlight([void updates(HighlightBuilder b)]) = _$Highlight;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(HighlightBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Highlight> get serializer => _$HighlightSerializer();
}

class _$HighlightSerializer implements PrimitiveSerializer<Highlight> {
  @override
  final Iterable<Type> types = const [Highlight, _$Highlight];

  @override
  final String wireName = r'Highlight';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Highlight object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'itemId';
    yield serializers.serialize(
      object.itemId,
      specifiedType: const FullType(String),
    );
    yield r'quote';
    yield serializers.serialize(
      object.quote,
      specifiedType: const FullType(String),
    );
    yield r'prefix';
    yield serializers.serialize(
      object.prefix,
      specifiedType: const FullType(String),
    );
    yield r'suffix';
    yield serializers.serialize(
      object.suffix,
      specifiedType: const FullType(String),
    );
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'color';
    yield serializers.serialize(
      object.color,
      specifiedType: const FullType(HighlightColor),
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
    Highlight object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required HighlightBuilder result,
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
        case r'itemId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.itemId = valueDes;
          break;
        case r'quote':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.quote = valueDes;
          break;
        case r'prefix':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.prefix = valueDes;
          break;
        case r'suffix':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.suffix = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        case r'color':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(HighlightColor),
          ) as HighlightColor;
          result.color = valueDes;
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
  Highlight deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = HighlightBuilder();
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

