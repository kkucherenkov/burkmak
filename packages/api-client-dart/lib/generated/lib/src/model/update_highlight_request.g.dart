// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_highlight_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UpdateHighlightRequest extends UpdateHighlightRequest {
  @override
  final String? note;
  @override
  final HighlightColor? color;

  factory _$UpdateHighlightRequest(
          [void Function(UpdateHighlightRequestBuilder)? updates]) =>
      (UpdateHighlightRequestBuilder()..update(updates))._build();

  _$UpdateHighlightRequest._({this.note, this.color}) : super._();
  @override
  UpdateHighlightRequest rebuild(
          void Function(UpdateHighlightRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UpdateHighlightRequestBuilder toBuilder() =>
      UpdateHighlightRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateHighlightRequest &&
        note == other.note &&
        color == other.color;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, color.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateHighlightRequest')
          ..add('note', note)
          ..add('color', color))
        .toString();
  }
}

class UpdateHighlightRequestBuilder
    implements Builder<UpdateHighlightRequest, UpdateHighlightRequestBuilder> {
  _$UpdateHighlightRequest? _$v;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  HighlightColor? _color;
  HighlightColor? get color => _$this._color;
  set color(HighlightColor? color) => _$this._color = color;

  UpdateHighlightRequestBuilder() {
    UpdateHighlightRequest._defaults(this);
  }

  UpdateHighlightRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _note = $v.note;
      _color = $v.color;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdateHighlightRequest other) {
    _$v = other as _$UpdateHighlightRequest;
  }

  @override
  void update(void Function(UpdateHighlightRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateHighlightRequest build() => _build();

  _$UpdateHighlightRequest _build() {
    final _$result = _$v ??
        _$UpdateHighlightRequest._(
          note: note,
          color: color,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
