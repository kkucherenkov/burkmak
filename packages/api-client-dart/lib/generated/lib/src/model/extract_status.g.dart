// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'extract_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const ExtractStatus _$none = const ExtractStatus._('none');
const ExtractStatus _$extracting = const ExtractStatus._('extracting');
const ExtractStatus _$ready = const ExtractStatus._('ready');
const ExtractStatus _$failed = const ExtractStatus._('failed');

ExtractStatus _$valueOf(String name) {
  switch (name) {
    case 'none':
      return _$none;
    case 'extracting':
      return _$extracting;
    case 'ready':
      return _$ready;
    case 'failed':
      return _$failed;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ExtractStatus> _$values =
    BuiltSet<ExtractStatus>(const <ExtractStatus>[
  _$none,
  _$extracting,
  _$ready,
  _$failed,
]);

class _$ExtractStatusMeta {
  const _$ExtractStatusMeta();
  ExtractStatus get none => _$none;
  ExtractStatus get extracting => _$extracting;
  ExtractStatus get ready => _$ready;
  ExtractStatus get failed => _$failed;
  ExtractStatus valueOf(String name) => _$valueOf(name);
  BuiltSet<ExtractStatus> get values => _$values;
}

abstract class _$ExtractStatusMixin {
  // ignore: non_constant_identifier_names
  _$ExtractStatusMeta get ExtractStatus => const _$ExtractStatusMeta();
}

Serializer<ExtractStatus> _$extractStatusSerializer =
    _$ExtractStatusSerializer();

class _$ExtractStatusSerializer implements PrimitiveSerializer<ExtractStatus> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'none': 'none',
    'extracting': 'extracting',
    'ready': 'ready',
    'failed': 'failed',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'none': 'none',
    'extracting': 'extracting',
    'ready': 'ready',
    'failed': 'failed',
  };

  @override
  final Iterable<Type> types = const <Type>[ExtractStatus];
  @override
  final String wireName = 'ExtractStatus';

  @override
  Object serialize(Serializers serializers, ExtractStatus object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  ExtractStatus deserialize(Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      ExtractStatus.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
