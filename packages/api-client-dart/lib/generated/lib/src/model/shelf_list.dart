//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:app_api_client/src/model/shelf.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'shelf_list.g.dart';

/// ShelfList
///
/// Properties:
/// * [shelves] 
@BuiltValue()
abstract class ShelfList implements Built<ShelfList, ShelfListBuilder> {
  @BuiltValueField(wireName: r'shelves')
  BuiltList<Shelf> get shelves;

  ShelfList._();

  factory ShelfList([void updates(ShelfListBuilder b)]) = _$ShelfList;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ShelfListBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ShelfList> get serializer => _$ShelfListSerializer();
}

class _$ShelfListSerializer implements PrimitiveSerializer<ShelfList> {
  @override
  final Iterable<Type> types = const [ShelfList, _$ShelfList];

  @override
  final String wireName = r'ShelfList';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ShelfList object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'shelves';
    yield serializers.serialize(
      object.shelves,
      specifiedType: const FullType(BuiltList, [FullType(Shelf)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ShelfList object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ShelfListBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'shelves':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Shelf)]),
          ) as BuiltList<Shelf>;
          result.shelves.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ShelfList deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ShelfListBuilder();
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

