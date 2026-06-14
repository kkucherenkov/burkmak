// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'item_list.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ItemList extends ItemList {
  @override
  final BuiltList<Item> items;
  @override
  final String? nextCursor;

  factory _$ItemList([void Function(ItemListBuilder)? updates]) =>
      (ItemListBuilder()..update(updates))._build();

  _$ItemList._({required this.items, this.nextCursor}) : super._();
  @override
  ItemList rebuild(void Function(ItemListBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ItemListBuilder toBuilder() => ItemListBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ItemList &&
        items == other.items &&
        nextCursor == other.nextCursor;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, nextCursor.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ItemList')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class ItemListBuilder implements Builder<ItemList, ItemListBuilder> {
  _$ItemList? _$v;

  ListBuilder<Item>? _items;
  ListBuilder<Item> get items => _$this._items ??= ListBuilder<Item>();
  set items(ListBuilder<Item>? items) => _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  ItemListBuilder() {
    ItemList._defaults(this);
  }

  ItemListBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ItemList other) {
    _$v = other as _$ItemList;
  }

  @override
  void update(void Function(ItemListBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ItemList build() => _build();

  _$ItemList _build() {
    _$ItemList _$result;
    try {
      _$result = _$v ??
          _$ItemList._(
            items: items.build(),
            nextCursor: nextCursor,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ItemList', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
