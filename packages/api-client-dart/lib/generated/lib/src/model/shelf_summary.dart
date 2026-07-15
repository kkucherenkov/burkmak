//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'shelf_summary.g.dart';

/// ShelfSummary
///
/// Properties:
/// * [id] - Unique shelf ID (uuid; doubles as the Kobo Tag.Id)
/// * [name] 
@BuiltValue()
abstract class ShelfSummary implements Built<ShelfSummary, ShelfSummaryBuilder> {
  /// Unique shelf ID (uuid; doubles as the Kobo Tag.Id)
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  ShelfSummary._();

  factory ShelfSummary([void updates(ShelfSummaryBuilder b)]) = _$ShelfSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ShelfSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ShelfSummary> get serializer => _$ShelfSummarySerializer();
}

class _$ShelfSummarySerializer implements PrimitiveSerializer<ShelfSummary> {
  @override
  final Iterable<Type> types = const [ShelfSummary, _$ShelfSummary];

  @override
  final String wireName = r'ShelfSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ShelfSummary object, {
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
  }

  @override
  Object serialize(
    Serializers serializers,
    ShelfSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ShelfSummaryBuilder result,
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ShelfSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ShelfSummaryBuilder();
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

