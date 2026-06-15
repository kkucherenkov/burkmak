//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:app_api_client/src/model/exported_note.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'export_bundle.g.dart';

/// Collection of markdown-rendered notes returned by the bulk export endpoint.
///
/// Properties:
/// * [notes] 
@BuiltValue()
abstract class ExportBundle implements Built<ExportBundle, ExportBundleBuilder> {
  @BuiltValueField(wireName: r'notes')
  BuiltList<ExportedNote> get notes;

  ExportBundle._();

  factory ExportBundle([void updates(ExportBundleBuilder b)]) = _$ExportBundle;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ExportBundleBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ExportBundle> get serializer => _$ExportBundleSerializer();
}

class _$ExportBundleSerializer implements PrimitiveSerializer<ExportBundle> {
  @override
  final Iterable<Type> types = const [ExportBundle, _$ExportBundle];

  @override
  final String wireName = r'ExportBundle';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ExportBundle object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'notes';
    yield serializers.serialize(
      object.notes,
      specifiedType: const FullType(BuiltList, [FullType(ExportedNote)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ExportBundle object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ExportBundleBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'notes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ExportedNote)]),
          ) as BuiltList<ExportedNote>;
          result.notes.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ExportBundle deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ExportBundleBuilder();
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

