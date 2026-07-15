//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'kind.g.dart';

class Kind extends EnumClass {

  /// Whether the item is a readable article (default) or a reference bookmark
  @BuiltValueEnumConst(wireName: r'article')
  static const Kind article = _$article;
  /// Whether the item is a readable article (default) or a reference bookmark
  @BuiltValueEnumConst(wireName: r'bookmark')
  static const Kind bookmark = _$bookmark;

  static Serializer<Kind> get serializer => _$kindSerializer;

  const Kind._(String name): super(name);

  static BuiltSet<Kind> get values => _$values;
  static Kind valueOf(String name) => _$valueOf(name);
}

/// Optionally, enum_class can generate a mixin to go with your enum for use
/// with Angular. It exposes your enum constants as getters. So, if you mix it
/// in to your Dart component class, the values become available to the
/// corresponding Angular template.
///
/// Trigger mixin generation by writing a line like this one next to your enum.
abstract class KindMixin = Object with _$KindMixin;

