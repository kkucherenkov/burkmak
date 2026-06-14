// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'highlight_color.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const HighlightColor _$yellow = const HighlightColor._('yellow');
const HighlightColor _$green = const HighlightColor._('green');
const HighlightColor _$blue = const HighlightColor._('blue');
const HighlightColor _$pink = const HighlightColor._('pink');

HighlightColor _$valueOf(String name) {
  switch (name) {
    case 'yellow':
      return _$yellow;
    case 'green':
      return _$green;
    case 'blue':
      return _$blue;
    case 'pink':
      return _$pink;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<HighlightColor> _$values =
    BuiltSet<HighlightColor>(const <HighlightColor>[
  _$yellow,
  _$green,
  _$blue,
  _$pink,
]);

class _$HighlightColorMeta {
  const _$HighlightColorMeta();
  HighlightColor get yellow => _$yellow;
  HighlightColor get green => _$green;
  HighlightColor get blue => _$blue;
  HighlightColor get pink => _$pink;
  HighlightColor valueOf(String name) => _$valueOf(name);
  BuiltSet<HighlightColor> get values => _$values;
}

abstract class _$HighlightColorMixin {
  // ignore: non_constant_identifier_names
  _$HighlightColorMeta get HighlightColor => const _$HighlightColorMeta();
}

Serializer<HighlightColor> _$highlightColorSerializer =
    _$HighlightColorSerializer();

class _$HighlightColorSerializer
    implements PrimitiveSerializer<HighlightColor> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'yellow': 'yellow',
    'green': 'green',
    'blue': 'blue',
    'pink': 'pink',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'yellow': 'yellow',
    'green': 'green',
    'blue': 'blue',
    'pink': 'pink',
  };

  @override
  final Iterable<Type> types = const <Type>[HighlightColor];
  @override
  final String wireName = 'HighlightColor';

  @override
  Object serialize(Serializers serializers, HighlightColor object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  HighlightColor deserialize(Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      HighlightColor.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
