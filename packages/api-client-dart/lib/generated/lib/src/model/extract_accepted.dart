//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:app_api_client/src/model/extract_status.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'extract_accepted.g.dart';

/// Response body returned when an extraction job is accepted (202).
///
/// Properties:
/// * [extractStatus] 
@BuiltValue()
abstract class ExtractAccepted implements Built<ExtractAccepted, ExtractAcceptedBuilder> {
  @BuiltValueField(wireName: r'extractStatus')
  ExtractStatus get extractStatus;
  // enum extractStatusEnum {  none,  extracting,  ready,  failed,  };

  ExtractAccepted._();

  factory ExtractAccepted([void updates(ExtractAcceptedBuilder b)]) = _$ExtractAccepted;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ExtractAcceptedBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ExtractAccepted> get serializer => _$ExtractAcceptedSerializer();
}

class _$ExtractAcceptedSerializer implements PrimitiveSerializer<ExtractAccepted> {
  @override
  final Iterable<Type> types = const [ExtractAccepted, _$ExtractAccepted];

  @override
  final String wireName = r'ExtractAccepted';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ExtractAccepted object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'extractStatus';
    yield serializers.serialize(
      object.extractStatus,
      specifiedType: const FullType(ExtractStatus),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ExtractAccepted object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ExtractAcceptedBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'extractStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ExtractStatus),
          ) as ExtractStatus;
          result.extractStatus = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ExtractAccepted deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ExtractAcceptedBuilder();
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

