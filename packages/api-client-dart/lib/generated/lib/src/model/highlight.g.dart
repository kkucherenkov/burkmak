// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'highlight.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Highlight extends Highlight {
  @override
  final String id;
  @override
  final String itemId;
  @override
  final String quote;
  @override
  final String prefix;
  @override
  final String suffix;
  @override
  final String? note;
  @override
  final HighlightColor color;
  @override
  final DateTime createdAt;

  factory _$Highlight([void Function(HighlightBuilder)? updates]) =>
      (HighlightBuilder()..update(updates))._build();

  _$Highlight._(
      {required this.id,
      required this.itemId,
      required this.quote,
      required this.prefix,
      required this.suffix,
      this.note,
      required this.color,
      required this.createdAt})
      : super._();
  @override
  Highlight rebuild(void Function(HighlightBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  HighlightBuilder toBuilder() => HighlightBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Highlight &&
        id == other.id &&
        itemId == other.itemId &&
        quote == other.quote &&
        prefix == other.prefix &&
        suffix == other.suffix &&
        note == other.note &&
        color == other.color &&
        createdAt == other.createdAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, itemId.hashCode);
    _$hash = $jc(_$hash, quote.hashCode);
    _$hash = $jc(_$hash, prefix.hashCode);
    _$hash = $jc(_$hash, suffix.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, color.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Highlight')
          ..add('id', id)
          ..add('itemId', itemId)
          ..add('quote', quote)
          ..add('prefix', prefix)
          ..add('suffix', suffix)
          ..add('note', note)
          ..add('color', color)
          ..add('createdAt', createdAt))
        .toString();
  }
}

class HighlightBuilder implements Builder<Highlight, HighlightBuilder> {
  _$Highlight? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _itemId;
  String? get itemId => _$this._itemId;
  set itemId(String? itemId) => _$this._itemId = itemId;

  String? _quote;
  String? get quote => _$this._quote;
  set quote(String? quote) => _$this._quote = quote;

  String? _prefix;
  String? get prefix => _$this._prefix;
  set prefix(String? prefix) => _$this._prefix = prefix;

  String? _suffix;
  String? get suffix => _$this._suffix;
  set suffix(String? suffix) => _$this._suffix = suffix;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  HighlightColor? _color;
  HighlightColor? get color => _$this._color;
  set color(HighlightColor? color) => _$this._color = color;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  HighlightBuilder() {
    Highlight._defaults(this);
  }

  HighlightBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _itemId = $v.itemId;
      _quote = $v.quote;
      _prefix = $v.prefix;
      _suffix = $v.suffix;
      _note = $v.note;
      _color = $v.color;
      _createdAt = $v.createdAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Highlight other) {
    _$v = other as _$Highlight;
  }

  @override
  void update(void Function(HighlightBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Highlight build() => _build();

  _$Highlight _build() {
    final _$result = _$v ??
        _$Highlight._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'Highlight', 'id'),
          itemId: BuiltValueNullFieldError.checkNotNull(
              itemId, r'Highlight', 'itemId'),
          quote: BuiltValueNullFieldError.checkNotNull(
              quote, r'Highlight', 'quote'),
          prefix: BuiltValueNullFieldError.checkNotNull(
              prefix, r'Highlight', 'prefix'),
          suffix: BuiltValueNullFieldError.checkNotNull(
              suffix, r'Highlight', 'suffix'),
          note: note,
          color: BuiltValueNullFieldError.checkNotNull(
              color, r'Highlight', 'color'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'Highlight', 'createdAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
