// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_highlight_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateHighlightRequest extends CreateHighlightRequest {
  @override
  final String quote;
  @override
  final String? prefix;
  @override
  final String? suffix;
  @override
  final String? note;
  @override
  final HighlightColor? color;

  factory _$CreateHighlightRequest(
          [void Function(CreateHighlightRequestBuilder)? updates]) =>
      (CreateHighlightRequestBuilder()..update(updates))._build();

  _$CreateHighlightRequest._(
      {required this.quote, this.prefix, this.suffix, this.note, this.color})
      : super._();
  @override
  CreateHighlightRequest rebuild(
          void Function(CreateHighlightRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CreateHighlightRequestBuilder toBuilder() =>
      CreateHighlightRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateHighlightRequest &&
        quote == other.quote &&
        prefix == other.prefix &&
        suffix == other.suffix &&
        note == other.note &&
        color == other.color;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, quote.hashCode);
    _$hash = $jc(_$hash, prefix.hashCode);
    _$hash = $jc(_$hash, suffix.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, color.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreateHighlightRequest')
          ..add('quote', quote)
          ..add('prefix', prefix)
          ..add('suffix', suffix)
          ..add('note', note)
          ..add('color', color))
        .toString();
  }
}

class CreateHighlightRequestBuilder
    implements Builder<CreateHighlightRequest, CreateHighlightRequestBuilder> {
  _$CreateHighlightRequest? _$v;

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

  CreateHighlightRequestBuilder() {
    CreateHighlightRequest._defaults(this);
  }

  CreateHighlightRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _quote = $v.quote;
      _prefix = $v.prefix;
      _suffix = $v.suffix;
      _note = $v.note;
      _color = $v.color;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreateHighlightRequest other) {
    _$v = other as _$CreateHighlightRequest;
  }

  @override
  void update(void Function(CreateHighlightRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateHighlightRequest build() => _build();

  _$CreateHighlightRequest _build() {
    final _$result = _$v ??
        _$CreateHighlightRequest._(
          quote: BuiltValueNullFieldError.checkNotNull(
              quote, r'CreateHighlightRequest', 'quote'),
          prefix: prefix,
          suffix: suffix,
          note: note,
          color: color,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
