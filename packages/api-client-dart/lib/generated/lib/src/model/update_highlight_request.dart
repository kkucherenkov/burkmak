//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:app_api_client/src/model/highlight_color.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_highlight_request.g.dart';

/// At least one of `note` or `color` must be provided.
///
/// Properties:
/// * [note] - Updated reader note; set to null to clear
/// * [color] 
@BuiltValue()
abstract class UpdateHighlightRequest implements Built<UpdateHighlightRequest, UpdateHighlightRequestBuilder> {
  /// Updated reader note; set to null to clear
  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'color')
  HighlightColor? get color;
  // enum colorEnum {  yellow,  green,  blue,  pink,  };

  UpdateHighlightRequest._();

  factory UpdateHighlightRequest([void updates(UpdateHighlightRequestBuilder b)]) = _$UpdateHighlightRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateHighlightRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateHighlightRequest> get serializer => _$UpdateHighlightRequestSerializer();
}

class _$UpdateHighlightRequestSerializer implements PrimitiveSerializer<UpdateHighlightRequest> {
  @override
  final Iterable<Type> types = const [UpdateHighlightRequest, _$UpdateHighlightRequest];

  @override
  final String wireName = r'UpdateHighlightRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateHighlightRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType.nullable(String),
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
    UpdateHighlightRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateHighlightRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UpdateHighlightRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateHighlightRequestBuilder();
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

