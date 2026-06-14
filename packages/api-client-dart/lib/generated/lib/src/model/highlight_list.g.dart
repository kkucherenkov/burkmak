// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'highlight_list.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$HighlightList extends HighlightList {
  @override
  final BuiltList<Highlight> highlights;

  factory _$HighlightList([void Function(HighlightListBuilder)? updates]) =>
      (HighlightListBuilder()..update(updates))._build();

  _$HighlightList._({required this.highlights}) : super._();
  @override
  HighlightList rebuild(void Function(HighlightListBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  HighlightListBuilder toBuilder() => HighlightListBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is HighlightList && highlights == other.highlights;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, highlights.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'HighlightList')
          ..add('highlights', highlights))
        .toString();
  }
}

class HighlightListBuilder
    implements Builder<HighlightList, HighlightListBuilder> {
  _$HighlightList? _$v;

  ListBuilder<Highlight>? _highlights;
  ListBuilder<Highlight> get highlights =>
      _$this._highlights ??= ListBuilder<Highlight>();
  set highlights(ListBuilder<Highlight>? highlights) =>
      _$this._highlights = highlights;

  HighlightListBuilder() {
    HighlightList._defaults(this);
  }

  HighlightListBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _highlights = $v.highlights.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(HighlightList other) {
    _$v = other as _$HighlightList;
  }

  @override
  void update(void Function(HighlightListBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  HighlightList build() => _build();

  _$HighlightList _build() {
    _$HighlightList _$result;
    try {
      _$result = _$v ??
          _$HighlightList._(
            highlights: highlights.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'highlights';
        highlights.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'HighlightList', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
