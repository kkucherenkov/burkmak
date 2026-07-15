// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'shelf_list.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ShelfList extends ShelfList {
  @override
  final BuiltList<Shelf> shelves;

  factory _$ShelfList([void Function(ShelfListBuilder)? updates]) =>
      (ShelfListBuilder()..update(updates))._build();

  _$ShelfList._({required this.shelves}) : super._();
  @override
  ShelfList rebuild(void Function(ShelfListBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ShelfListBuilder toBuilder() => ShelfListBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ShelfList && shelves == other.shelves;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, shelves.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ShelfList')..add('shelves', shelves))
        .toString();
  }
}

class ShelfListBuilder implements Builder<ShelfList, ShelfListBuilder> {
  _$ShelfList? _$v;

  ListBuilder<Shelf>? _shelves;
  ListBuilder<Shelf> get shelves => _$this._shelves ??= ListBuilder<Shelf>();
  set shelves(ListBuilder<Shelf>? shelves) => _$this._shelves = shelves;

  ShelfListBuilder() {
    ShelfList._defaults(this);
  }

  ShelfListBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _shelves = $v.shelves.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ShelfList other) {
    _$v = other as _$ShelfList;
  }

  @override
  void update(void Function(ShelfListBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ShelfList build() => _build();

  _$ShelfList _build() {
    _$ShelfList _$result;
    try {
      _$result = _$v ??
          _$ShelfList._(
            shelves: shelves.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'shelves';
        shelves.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ShelfList', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
