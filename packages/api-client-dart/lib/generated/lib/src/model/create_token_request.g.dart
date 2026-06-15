// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_token_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateTokenRequest extends CreateTokenRequest {
  @override
  final String name;

  factory _$CreateTokenRequest(
          [void Function(CreateTokenRequestBuilder)? updates]) =>
      (CreateTokenRequestBuilder()..update(updates))._build();

  _$CreateTokenRequest._({required this.name}) : super._();
  @override
  CreateTokenRequest rebuild(
          void Function(CreateTokenRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CreateTokenRequestBuilder toBuilder() =>
      CreateTokenRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateTokenRequest && name == other.name;
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
    return (newBuiltValueToStringHelper(r'CreateTokenRequest')
          ..add('name', name))
        .toString();
  }
}

class CreateTokenRequestBuilder
    implements Builder<CreateTokenRequest, CreateTokenRequestBuilder> {
  _$CreateTokenRequest? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  CreateTokenRequestBuilder() {
    CreateTokenRequest._defaults(this);
  }

  CreateTokenRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreateTokenRequest other) {
    _$v = other as _$CreateTokenRequest;
  }

  @override
  void update(void Function(CreateTokenRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateTokenRequest build() => _build();

  _$CreateTokenRequest _build() {
    final _$result = _$v ??
        _$CreateTokenRequest._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'CreateTokenRequest', 'name'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
