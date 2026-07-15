// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'rename_shelf_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RenameShelfRequest extends RenameShelfRequest {
  @override
  final String name;

  factory _$RenameShelfRequest(
          [void Function(RenameShelfRequestBuilder)? updates]) =>
      (RenameShelfRequestBuilder()..update(updates))._build();

  _$RenameShelfRequest._({required this.name}) : super._();
  @override
  RenameShelfRequest rebuild(
          void Function(RenameShelfRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RenameShelfRequestBuilder toBuilder() =>
      RenameShelfRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RenameShelfRequest && name == other.name;
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
    return (newBuiltValueToStringHelper(r'RenameShelfRequest')
          ..add('name', name))
        .toString();
  }
}

class RenameShelfRequestBuilder
    implements Builder<RenameShelfRequest, RenameShelfRequestBuilder> {
  _$RenameShelfRequest? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  RenameShelfRequestBuilder() {
    RenameShelfRequest._defaults(this);
  }

  RenameShelfRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RenameShelfRequest other) {
    _$v = other as _$RenameShelfRequest;
  }

  @override
  void update(void Function(RenameShelfRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RenameShelfRequest build() => _build();

  _$RenameShelfRequest _build() {
    final _$result = _$v ??
        _$RenameShelfRequest._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'RenameShelfRequest', 'name'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
