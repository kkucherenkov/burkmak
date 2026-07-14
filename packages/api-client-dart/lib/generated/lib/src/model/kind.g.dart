// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kind.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const Kind _$article = const Kind._('article');
const Kind _$bookmark = const Kind._('bookmark');

Kind _$valueOf(String name) {
  switch (name) {
    case 'article':
      return _$article;
    case 'bookmark':
      return _$bookmark;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<Kind> _$values = BuiltSet<Kind>(const <Kind>[
  _$article,
  _$bookmark,
]);

class _$KindMeta {
  const _$KindMeta();
  Kind get article => _$article;
  Kind get bookmark => _$bookmark;
  Kind valueOf(String name) => _$valueOf(name);
  BuiltSet<Kind> get values => _$values;
}

abstract class _$KindMixin {
  // ignore: non_constant_identifier_names
  _$KindMeta get Kind => const _$KindMeta();
}

Serializer<Kind> _$kindSerializer = _$KindSerializer();

class _$KindSerializer implements PrimitiveSerializer<Kind> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'article': 'article',
    'bookmark': 'bookmark',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'article': 'article',
    'bookmark': 'bookmark',
  };

  @override
  final Iterable<Type> types = const <Type>[Kind];
  @override
  final String wireName = 'Kind';

  @override
  Object serialize(Serializers serializers, Kind object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  Kind deserialize(Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      Kind.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
