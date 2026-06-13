//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:app_api_client/src/model/tag.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'tag_list.g.dart';

/// TagList
///
/// Properties:
/// * [tags] 
@BuiltValue()
abstract class TagList implements Built<TagList, TagListBuilder> {
  @BuiltValueField(wireName: r'tags')
  BuiltList<Tag> get tags;

  TagList._();

  factory TagList([void updates(TagListBuilder b)]) = _$TagList;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TagListBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TagList> get serializer => _$TagListSerializer();
}

class _$TagListSerializer implements PrimitiveSerializer<TagList> {
  @override
  final Iterable<Type> types = const [TagList, _$TagList];

  @override
  final String wireName = r'TagList';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TagList object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'tags';
    yield serializers.serialize(
      object.tags,
      specifiedType: const FullType(BuiltList, [FullType(Tag)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    TagList object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TagListBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'tags':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Tag)]),
          ) as BuiltList<Tag>;
          result.tags.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  TagList deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TagListBuilder();
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

