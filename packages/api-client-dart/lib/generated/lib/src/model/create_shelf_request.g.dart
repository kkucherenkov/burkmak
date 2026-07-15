// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_shelf_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateShelfRequest extends CreateShelfRequest {
  @override
  final String name;

  factory _$CreateShelfRequest(
          [void Function(CreateShelfRequestBuilder)? updates]) =>
      (CreateShelfRequestBuilder()..update(updates))._build();

  _$CreateShelfRequest._({required this.name}) : super._();
  @override
  CreateShelfRequest rebuild(
          void Function(CreateShelfRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CreateShelfRequestBuilder toBuilder() =>
      CreateShelfRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateShelfRequest && name == other.name;
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
    return (newBuiltValueToStringHelper(r'CreateShelfRequest')
          ..add('name', name))
        .toString();
  }
}

class CreateShelfRequestBuilder
    implements Builder<CreateShelfRequest, CreateShelfRequestBuilder> {
  _$CreateShelfRequest? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  CreateShelfRequestBuilder() {
    CreateShelfRequest._defaults(this);
  }

  CreateShelfRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreateShelfRequest other) {
    _$v = other as _$CreateShelfRequest;
  }

  @override
  void update(void Function(CreateShelfRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateShelfRequest build() => _build();

  _$CreateShelfRequest _build() {
    final _$result = _$v ??
        _$CreateShelfRequest._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'CreateShelfRequest', 'name'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
