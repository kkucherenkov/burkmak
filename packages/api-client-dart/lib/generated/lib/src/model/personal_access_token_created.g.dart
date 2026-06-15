// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'personal_access_token_created.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PersonalAccessTokenCreated extends PersonalAccessTokenCreated {
  @override
  final String id;
  @override
  final String name;
  @override
  final String prefix;
  @override
  final String token;
  @override
  final DateTime createdAt;

  factory _$PersonalAccessTokenCreated(
          [void Function(PersonalAccessTokenCreatedBuilder)? updates]) =>
      (PersonalAccessTokenCreatedBuilder()..update(updates))._build();

  _$PersonalAccessTokenCreated._(
      {required this.id,
      required this.name,
      required this.prefix,
      required this.token,
      required this.createdAt})
      : super._();
  @override
  PersonalAccessTokenCreated rebuild(
          void Function(PersonalAccessTokenCreatedBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PersonalAccessTokenCreatedBuilder toBuilder() =>
      PersonalAccessTokenCreatedBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PersonalAccessTokenCreated &&
        id == other.id &&
        name == other.name &&
        prefix == other.prefix &&
        token == other.token &&
        createdAt == other.createdAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, prefix.hashCode);
    _$hash = $jc(_$hash, token.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PersonalAccessTokenCreated')
          ..add('id', id)
          ..add('name', name)
          ..add('prefix', prefix)
          ..add('token', token)
          ..add('createdAt', createdAt))
        .toString();
  }
}

class PersonalAccessTokenCreatedBuilder
    implements
        Builder<PersonalAccessTokenCreated, PersonalAccessTokenCreatedBuilder> {
  _$PersonalAccessTokenCreated? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _prefix;
  String? get prefix => _$this._prefix;
  set prefix(String? prefix) => _$this._prefix = prefix;

  String? _token;
  String? get token => _$this._token;
  set token(String? token) => _$this._token = token;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  PersonalAccessTokenCreatedBuilder() {
    PersonalAccessTokenCreated._defaults(this);
  }

  PersonalAccessTokenCreatedBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _prefix = $v.prefix;
      _token = $v.token;
      _createdAt = $v.createdAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PersonalAccessTokenCreated other) {
    _$v = other as _$PersonalAccessTokenCreated;
  }

  @override
  void update(void Function(PersonalAccessTokenCreatedBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PersonalAccessTokenCreated build() => _build();

  _$PersonalAccessTokenCreated _build() {
    final _$result = _$v ??
        _$PersonalAccessTokenCreated._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'PersonalAccessTokenCreated', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'PersonalAccessTokenCreated', 'name'),
          prefix: BuiltValueNullFieldError.checkNotNull(
              prefix, r'PersonalAccessTokenCreated', 'prefix'),
          token: BuiltValueNullFieldError.checkNotNull(
              token, r'PersonalAccessTokenCreated', 'token'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'PersonalAccessTokenCreated', 'createdAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
