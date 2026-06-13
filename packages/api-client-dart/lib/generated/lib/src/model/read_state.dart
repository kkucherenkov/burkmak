//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'read_state.g.dart';

class ReadState extends EnumClass {

  /// The user's read progress for an item
  @BuiltValueEnumConst(wireName: r'unread')
  static const ReadState unread = _$unread;
  /// The user's read progress for an item
  @BuiltValueEnumConst(wireName: r'read')
  static const ReadState read = _$read;
  /// The user's read progress for an item
  @BuiltValueEnumConst(wireName: r'archived')
  static const ReadState archived = _$archived;

  static Serializer<ReadState> get serializer => _$readStateSerializer;

  const ReadState._(String name): super(name);

  static BuiltSet<ReadState> get values => _$values;
  static ReadState valueOf(String name) => _$valueOf(name);
}

/// Optionally, enum_class can generate a mixin to go with your enum for use
/// with Angular. It exposes your enum constants as getters. So, if you mix it
/// in to your Dart component class, the values become available to the
/// corresponding Angular template.
///
/// Trigger mixin generation by writing a line like this one next to your enum.
abstract class ReadStateMixin = Object with _$ReadStateMixin;

