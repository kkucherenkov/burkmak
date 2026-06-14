// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'item_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const ItemStatus _$pending = const ItemStatus._('pending');
const ItemStatus _$ready = const ItemStatus._('ready');
const ItemStatus _$failed = const ItemStatus._('failed');

ItemStatus _$valueOf(String name) {
  switch (name) {
    case 'pending':
      return _$pending;
    case 'ready':
      return _$ready;
    case 'failed':
      return _$failed;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ItemStatus> _$values = BuiltSet<ItemStatus>(const <ItemStatus>[
  _$pending,
  _$ready,
  _$failed,
]);

class _$ItemStatusMeta {
  const _$ItemStatusMeta();
  ItemStatus get pending => _$pending;
  ItemStatus get ready => _$ready;
  ItemStatus get failed => _$failed;
  ItemStatus valueOf(String name) => _$valueOf(name);
  BuiltSet<ItemStatus> get values => _$values;
}

abstract class _$ItemStatusMixin {
  // ignore: non_constant_identifier_names
  _$ItemStatusMeta get ItemStatus => const _$ItemStatusMeta();
}

Serializer<ItemStatus> _$itemStatusSerializer = _$ItemStatusSerializer();

class _$ItemStatusSerializer implements PrimitiveSerializer<ItemStatus> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'pending': 'pending',
    'ready': 'ready',
    'failed': 'failed',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'pending': 'pending',
    'ready': 'ready',
    'failed': 'failed',
  };

  @override
  final Iterable<Type> types = const <Type>[ItemStatus];
  @override
  final String wireName = 'ItemStatus';

  @override
  Object serialize(Serializers serializers, ItemStatus object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  ItemStatus deserialize(Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      ItemStatus.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
