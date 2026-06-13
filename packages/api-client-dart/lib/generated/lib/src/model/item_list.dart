//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:app_api_client/src/model/item.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'item_list.g.dart';

/// ItemList
///
/// Properties:
/// * [items] 
/// * [nextCursor] - Opaque cursor for the next page; null when no more pages
@BuiltValue()
abstract class ItemList implements Built<ItemList, ItemListBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<Item> get items;

  /// Opaque cursor for the next page; null when no more pages
  @BuiltValueField(wireName: r'nextCursor')
  String? get nextCursor;

  ItemList._();

  factory ItemList([void updates(ItemListBuilder b)]) = _$ItemList;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ItemListBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ItemList> get serializer => _$ItemListSerializer();
}

class _$ItemListSerializer implements PrimitiveSerializer<ItemList> {
  @override
  final Iterable<Type> types = const [ItemList, _$ItemList];

  @override
  final String wireName = r'ItemList';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ItemList object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(Item)]),
    );
    yield r'nextCursor';
    yield object.nextCursor == null ? null : serializers.serialize(
      object.nextCursor,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ItemList object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ItemListBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Item)]),
          ) as BuiltList<Item>;
          result.items.replace(valueDes);
          break;
        case r'nextCursor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.nextCursor = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ItemList deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ItemListBuilder();
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

