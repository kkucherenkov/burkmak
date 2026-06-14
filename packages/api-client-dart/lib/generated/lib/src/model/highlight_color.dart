//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'highlight_color.g.dart';

class HighlightColor extends EnumClass {

  /// Color label for a text highlight
  @BuiltValueEnumConst(wireName: r'yellow')
  static const HighlightColor yellow = _$yellow;
  /// Color label for a text highlight
  @BuiltValueEnumConst(wireName: r'green')
  static const HighlightColor green = _$green;
  /// Color label for a text highlight
  @BuiltValueEnumConst(wireName: r'blue')
  static const HighlightColor blue = _$blue;
  /// Color label for a text highlight
  @BuiltValueEnumConst(wireName: r'pink')
  static const HighlightColor pink = _$pink;

  static Serializer<HighlightColor> get serializer => _$highlightColorSerializer;

  const HighlightColor._(String name): super(name);

  static BuiltSet<HighlightColor> get values => _$values;
  static HighlightColor valueOf(String name) => _$valueOf(name);
}

/// Optionally, enum_class can generate a mixin to go with your enum for use
/// with Angular. It exposes your enum constants as getters. So, if you mix it
/// in to your Dart component class, the values become available to the
/// corresponding Angular template.
///
/// Trigger mixin generation by writing a line like this one next to your enum.
abstract class HighlightColorMixin = Object with _$HighlightColorMixin;

