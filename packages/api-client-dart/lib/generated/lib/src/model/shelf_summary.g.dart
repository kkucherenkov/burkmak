// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'shelf_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ShelfSummary extends ShelfSummary {
  @override
  final String id;
  @override
  final String name;

  factory _$ShelfSummary([void Function(ShelfSummaryBuilder)? updates]) =>
      (ShelfSummaryBuilder()..update(updates))._build();

  _$ShelfSummary._({required this.id, required this.name}) : super._();
  @override
  ShelfSummary rebuild(void Function(ShelfSummaryBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ShelfSummaryBuilder toBuilder() => ShelfSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ShelfSummary && id == other.id && name == other.name;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ShelfSummary')
          ..add('id', id)
          ..add('name', name))
        .toString();
  }
}

class ShelfSummaryBuilder
    implements Builder<ShelfSummary, ShelfSummaryBuilder> {
  _$ShelfSummary? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  ShelfSummaryBuilder() {
    ShelfSummary._defaults(this);
  }

  ShelfSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ShelfSummary other) {
    _$v = other as _$ShelfSummary;
  }

  @override
  void update(void Function(ShelfSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ShelfSummary build() => _build();

  _$ShelfSummary _build() {
    final _$result = _$v ??
        _$ShelfSummary._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'ShelfSummary', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'ShelfSummary', 'name'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
