// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'personal_access_token.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PersonalAccessToken extends PersonalAccessToken {
  @override
  final String id;
  @override
  final String name;
  @override
  final String prefix;
  @override
  final DateTime? lastUsedAt;
  @override
  final DateTime createdAt;

  factory _$PersonalAccessToken(
          [void Function(PersonalAccessTokenBuilder)? updates]) =>
      (PersonalAccessTokenBuilder()..update(updates))._build();

  _$PersonalAccessToken._(
      {required this.id,
      required this.name,
      required this.prefix,
      this.lastUsedAt,
      required this.createdAt})
      : super._();
  @override
  PersonalAccessToken rebuild(
          void Function(PersonalAccessTokenBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PersonalAccessTokenBuilder toBuilder() =>
      PersonalAccessTokenBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PersonalAccessToken &&
        id == other.id &&
        name == other.name &&
        prefix == other.prefix &&
        lastUsedAt == other.lastUsedAt &&
        createdAt == other.createdAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, prefix.hashCode);
    _$hash = $jc(_$hash, lastUsedAt.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PersonalAccessToken')
          ..add('id', id)
          ..add('name', name)
          ..add('prefix', prefix)
          ..add('lastUsedAt', lastUsedAt)
          ..add('createdAt', createdAt))
        .toString();
  }
}

class PersonalAccessTokenBuilder
    implements Builder<PersonalAccessToken, PersonalAccessTokenBuilder> {
  _$PersonalAccessToken? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _prefix;
  String? get prefix => _$this._prefix;
  set prefix(String? prefix) => _$this._prefix = prefix;

  DateTime? _lastUsedAt;
  DateTime? get lastUsedAt => _$this._lastUsedAt;
  set lastUsedAt(DateTime? lastUsedAt) => _$this._lastUsedAt = lastUsedAt;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  PersonalAccessTokenBuilder() {
    PersonalAccessToken._defaults(this);
  }

  PersonalAccessTokenBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _prefix = $v.prefix;
      _lastUsedAt = $v.lastUsedAt;
      _createdAt = $v.createdAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PersonalAccessToken other) {
    _$v = other as _$PersonalAccessToken;
  }

  @override
  void update(void Function(PersonalAccessTokenBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PersonalAccessToken build() => _build();

  _$PersonalAccessToken _build() {
    final _$result = _$v ??
        _$PersonalAccessToken._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'PersonalAccessToken', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'PersonalAccessToken', 'name'),
          prefix: BuiltValueNullFieldError.checkNotNull(
              prefix, r'PersonalAccessToken', 'prefix'),
          lastUsedAt: lastUsedAt,
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'PersonalAccessToken', 'createdAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
