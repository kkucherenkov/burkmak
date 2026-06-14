//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:app_api_client/src/model/highlight.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'highlight_list.g.dart';

/// HighlightList
///
/// Properties:
/// * [highlights] 
@BuiltValue()
abstract class HighlightList implements Built<HighlightList, HighlightListBuilder> {
  @BuiltValueField(wireName: r'highlights')
  BuiltList<Highlight> get highlights;

  HighlightList._();

  factory HighlightList([void updates(HighlightListBuilder b)]) = _$HighlightList;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(HighlightListBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<HighlightList> get serializer => _$HighlightListSerializer();
}

class _$HighlightListSerializer implements PrimitiveSerializer<HighlightList> {
  @override
  final Iterable<Type> types = const [HighlightList, _$HighlightList];

  @override
  final String wireName = r'HighlightList';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    HighlightList object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'highlights';
    yield serializers.serialize(
      object.highlights,
      specifiedType: const FullType(BuiltList, [FullType(Highlight)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    HighlightList object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required HighlightListBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'highlights':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Highlight)]),
          ) as BuiltList<Highlight>;
          result.highlights.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  HighlightList deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = HighlightListBuilder();
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

