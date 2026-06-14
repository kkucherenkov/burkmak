//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'extract_status.g.dart';

class ExtractStatus extends EnumClass {

  /// Status of the article content extraction job for an item
  @BuiltValueEnumConst(wireName: r'none')
  static const ExtractStatus none = _$none;
  /// Status of the article content extraction job for an item
  @BuiltValueEnumConst(wireName: r'extracting')
  static const ExtractStatus extracting = _$extracting;
  /// Status of the article content extraction job for an item
  @BuiltValueEnumConst(wireName: r'ready')
  static const ExtractStatus ready = _$ready;
  /// Status of the article content extraction job for an item
  @BuiltValueEnumConst(wireName: r'failed')
  static const ExtractStatus failed = _$failed;

  static Serializer<ExtractStatus> get serializer => _$extractStatusSerializer;

  const ExtractStatus._(String name): super(name);

  static BuiltSet<ExtractStatus> get values => _$values;
  static ExtractStatus valueOf(String name) => _$valueOf(name);
}

/// Optionally, enum_class can generate a mixin to go with your enum for use
/// with Angular. It exposes your enum constants as getters. So, if you mix it
/// in to your Dart component class, the values become available to the
/// corresponding Angular template.
///
/// Trigger mixin generation by writing a line like this one next to your enum.
abstract class ExtractStatusMixin = Object with _$ExtractStatusMixin;

