// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'read_state.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const ReadState _$unread = const ReadState._('unread');
const ReadState _$read = const ReadState._('read');
const ReadState _$archived = const ReadState._('archived');

ReadState _$valueOf(String name) {
  switch (name) {
    case 'unread':
      return _$unread;
    case 'read':
      return _$read;
    case 'archived':
      return _$archived;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ReadState> _$values = BuiltSet<ReadState>(const <ReadState>[
  _$unread,
  _$read,
  _$archived,
]);

class _$ReadStateMeta {
  const _$ReadStateMeta();
  ReadState get unread => _$unread;
  ReadState get read => _$read;
  ReadState get archived => _$archived;
  ReadState valueOf(String name) => _$valueOf(name);
  BuiltSet<ReadState> get values => _$values;
}

abstract class _$ReadStateMixin {
  // ignore: non_constant_identifier_names
  _$ReadStateMeta get ReadState => const _$ReadStateMeta();
}

Serializer<ReadState> _$readStateSerializer = _$ReadStateSerializer();

class _$ReadStateSerializer implements PrimitiveSerializer<ReadState> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'unread': 'unread',
    'read': 'read',
    'archived': 'archived',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'unread': 'unread',
    'read': 'read',
    'archived': 'archived',
  };

  @override
  final Iterable<Type> types = const <Type>[ReadState];
  @override
  final String wireName = 'ReadState';

  @override
  Object serialize(Serializers serializers, ReadState object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  ReadState deserialize(Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      ReadState.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
