//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:app_api_client/src/model/highlight_color.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_highlight_request.g.dart';

/// CreateHighlightRequest
///
/// Properties:
/// * [quote] - The exact text that was highlighted
/// * [prefix] - Short text immediately before the quote (for anchor context)
/// * [suffix] - Short text immediately after the quote (for anchor context)
/// * [note] - Optional reader note to attach. To clear a note on an existing highlight, use `PATCH /highlights/{id}` with `note: null` — create only sets a note, it cannot null one. 
/// * [color] 
@BuiltValue()
abstract class CreateHighlightRequest implements Built<CreateHighlightRequest, CreateHighlightRequestBuilder> {
  /// The exact text that was highlighted
  @BuiltValueField(wireName: r'quote')
  String get quote;

  /// Short text immediately before the quote (for anchor context)
  @BuiltValueField(wireName: r'prefix')
  String? get prefix;

  /// Short text immediately after the quote (for anchor context)
  @BuiltValueField(wireName: r'suffix')
  String? get suffix;

  /// Optional reader note to attach. To clear a note on an existing highlight, use `PATCH /highlights/{id}` with `note: null` — create only sets a note, it cannot null one. 
  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'color')
  HighlightColor? get color;
  // enum colorEnum {  yellow,  green,  blue,  pink,  };

  CreateHighlightRequest._();

  factory CreateHighlightRequest([void updates(CreateHighlightRequestBuilder b)]) = _$CreateHighlightRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateHighlightRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateHighlightRequest> get serializer => _$CreateHighlightRequestSerializer();
}

class _$CreateHighlightRequestSerializer implements PrimitiveSerializer<CreateHighlightRequest> {
  @override
  final Iterable<Type> types = const [CreateHighlightRequest, _$CreateHighlightRequest];

  @override
  final String wireName = r'CreateHighlightRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateHighlightRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'quote';
    yield serializers.serialize(
      object.quote,
      specifiedType: const FullType(String),
    );
    if (object.prefix != null) {
      yield r'prefix';
      yield serializers.serialize(
        object.prefix,
        specifiedType: const FullType(String),
      );
    }
    if (object.suffix != null) {
      yield r'suffix';
      yield serializers.serialize(
        object.suffix,
        specifiedType: const FullType(String),
      );
    }
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType(String),
      );
    }
    if (object.color != null) {
      yield r'color';
      yield serializers.serialize(
        object.color,
        specifiedType: const FullType(HighlightColor),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    CreateHighlightRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateHighlightRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
            specifiedType: const FullType(String),
          ) as String;
          result.note = valueDes;
          break;
        case r'color':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(HighlightColor),
          ) as HighlightColor;
          result.color = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CreateHighlightRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateHighlightRequestBuilder();
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

