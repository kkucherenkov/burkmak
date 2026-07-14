//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:app_api_client/src/model/read_state.dart';
import 'package:app_api_client/src/model/kind.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_item_request.g.dart';

/// At least one of `readState`, `favorite`, or `kind` must be provided.
///
/// Properties:
/// * [readState] 
/// * [favorite] - Set or clear the favourite flag
/// * [kind] - Promote a bookmark into the reading queue, or demote an article to a bookmark
@BuiltValue()
abstract class UpdateItemRequest implements Built<UpdateItemRequest, UpdateItemRequestBuilder> {
  @BuiltValueField(wireName: r'readState')
  ReadState? get readState;
  // enum readStateEnum {  unread,  read,  archived,  };

  /// Set or clear the favourite flag
  @BuiltValueField(wireName: r'favorite')
  bool? get favorite;

  /// Promote a bookmark into the reading queue, or demote an article to a bookmark
  @BuiltValueField(wireName: r'kind')
  Kind? get kind;
  // enum kindEnum {  article,  bookmark,  };

  UpdateItemRequest._();

  factory UpdateItemRequest([void updates(UpdateItemRequestBuilder b)]) = _$UpdateItemRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateItemRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateItemRequest> get serializer => _$UpdateItemRequestSerializer();
}

class _$UpdateItemRequestSerializer implements PrimitiveSerializer<UpdateItemRequest> {
  @override
  final Iterable<Type> types = const [UpdateItemRequest, _$UpdateItemRequest];

  @override
  final String wireName = r'UpdateItemRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateItemRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.readState != null) {
      yield r'readState';
      yield serializers.serialize(
        object.readState,
        specifiedType: const FullType(ReadState),
      );
    }
    if (object.favorite != null) {
      yield r'favorite';
      yield serializers.serialize(
        object.favorite,
        specifiedType: const FullType(bool),
      );
    }
    if (object.kind != null) {
      yield r'kind';
      yield serializers.serialize(
        object.kind,
        specifiedType: const FullType(Kind),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdateItemRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateItemRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'readState':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ReadState),
          ) as ReadState;
          result.readState = valueDes;
          break;
        case r'favorite':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.favorite = valueDes;
          break;
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Kind),
          ) as Kind;
          result.kind = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UpdateItemRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateItemRequestBuilder();
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

