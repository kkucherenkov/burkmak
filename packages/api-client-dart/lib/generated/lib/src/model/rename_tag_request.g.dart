// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'rename_tag_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RenameTagRequest extends RenameTagRequest {
  @override
  final String name;

  factory _$RenameTagRequest(
          [void Function(RenameTagRequestBuilder)? updates]) =>
      (RenameTagRequestBuilder()..update(updates))._build();

  _$RenameTagRequest._({required this.name}) : super._();
  @override
  RenameTagRequest rebuild(void Function(RenameTagRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RenameTagRequestBuilder toBuilder() =>
      RenameTagRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RenameTagRequest && name == other.name;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RenameTagRequest')..add('name', name))
        .toString();
  }
}

class RenameTagRequestBuilder
    implements Builder<RenameTagRequest, RenameTagRequestBuilder> {
  _$RenameTagRequest? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  RenameTagRequestBuilder() {
    RenameTagRequest._defaults(this);
  }

  RenameTagRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RenameTagRequest other) {
    _$v = other as _$RenameTagRequest;
  }

  @override
  void update(void Function(RenameTagRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RenameTagRequest build() => _build();

  _$RenameTagRequest _build() {
    final _$result = _$v ??
        _$RenameTagRequest._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'RenameTagRequest', 'name'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
