// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'shelf.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Shelf extends Shelf {
  @override
  final String id;
  @override
  final String name;
  @override
  final int itemCount;
  @override
  final DateTime createdAt;
  @override
  final DateTime lastModified;

  factory _$Shelf([void Function(ShelfBuilder)? updates]) =>
      (ShelfBuilder()..update(updates))._build();

  _$Shelf._(
      {required this.id,
      required this.name,
      required this.itemCount,
      required this.createdAt,
      required this.lastModified})
      : super._();
  @override
  Shelf rebuild(void Function(ShelfBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ShelfBuilder toBuilder() => ShelfBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Shelf &&
        id == other.id &&
        name == other.name &&
        itemCount == other.itemCount &&
        createdAt == other.createdAt &&
        lastModified == other.lastModified;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, itemCount.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, lastModified.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Shelf')
          ..add('id', id)
          ..add('name', name)
          ..add('itemCount', itemCount)
          ..add('createdAt', createdAt)
          ..add('lastModified', lastModified))
        .toString();
  }
}

class ShelfBuilder implements Builder<Shelf, ShelfBuilder> {
  _$Shelf? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _itemCount;
  int? get itemCount => _$this._itemCount;
  set itemCount(int? itemCount) => _$this._itemCount = itemCount;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _lastModified;
  DateTime? get lastModified => _$this._lastModified;
  set lastModified(DateTime? lastModified) =>
      _$this._lastModified = lastModified;

  ShelfBuilder() {
    Shelf._defaults(this);
  }

  ShelfBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _itemCount = $v.itemCount;
      _createdAt = $v.createdAt;
      _lastModified = $v.lastModified;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Shelf other) {
    _$v = other as _$Shelf;
  }

  @override
  void update(void Function(ShelfBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Shelf build() => _build();

  _$Shelf _build() {
    final _$result = _$v ??
        _$Shelf._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'Shelf', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(name, r'Shelf', 'name'),
          itemCount: BuiltValueNullFieldError.checkNotNull(
              itemCount, r'Shelf', 'itemCount'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'Shelf', 'createdAt'),
          lastModified: BuiltValueNullFieldError.checkNotNull(
              lastModified, r'Shelf', 'lastModified'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
