// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'health_status_dependencies.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$HealthStatusDependencies extends HealthStatusDependencies {
  @override
  final DependencyStatus? db;

  factory _$HealthStatusDependencies(
          [void Function(HealthStatusDependenciesBuilder)? updates]) =>
      (HealthStatusDependenciesBuilder()..update(updates))._build();

  _$HealthStatusDependencies._({this.db}) : super._();
  @override
  HealthStatusDependencies rebuild(
          void Function(HealthStatusDependenciesBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  HealthStatusDependenciesBuilder toBuilder() =>
      HealthStatusDependenciesBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is HealthStatusDependencies && db == other.db;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, db.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'HealthStatusDependencies')
          ..add('db', db))
        .toString();
  }
}

class HealthStatusDependenciesBuilder
    implements
        Builder<HealthStatusDependencies, HealthStatusDependenciesBuilder> {
  _$HealthStatusDependencies? _$v;

  DependencyStatus? _db;
  DependencyStatus? get db => _$this._db;
  set db(DependencyStatus? db) => _$this._db = db;

  HealthStatusDependenciesBuilder() {
    HealthStatusDependencies._defaults(this);
  }

  HealthStatusDependenciesBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _db = $v.db;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(HealthStatusDependencies other) {
    _$v = other as _$HealthStatusDependencies;
  }

  @override
  void update(void Function(HealthStatusDependenciesBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  HealthStatusDependencies build() => _build();

  _$HealthStatusDependencies _build() {
    final _$result = _$v ??
        _$HealthStatusDependencies._(
          db: db,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
