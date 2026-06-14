// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'extract_accepted.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ExtractAccepted extends ExtractAccepted {
  @override
  final ExtractStatus extractStatus;

  factory _$ExtractAccepted([void Function(ExtractAcceptedBuilder)? updates]) =>
      (ExtractAcceptedBuilder()..update(updates))._build();

  _$ExtractAccepted._({required this.extractStatus}) : super._();
  @override
  ExtractAccepted rebuild(void Function(ExtractAcceptedBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ExtractAcceptedBuilder toBuilder() => ExtractAcceptedBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ExtractAccepted && extractStatus == other.extractStatus;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, extractStatus.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ExtractAccepted')
          ..add('extractStatus', extractStatus))
        .toString();
  }
}

class ExtractAcceptedBuilder
    implements Builder<ExtractAccepted, ExtractAcceptedBuilder> {
  _$ExtractAccepted? _$v;

  ExtractStatus? _extractStatus;
  ExtractStatus? get extractStatus => _$this._extractStatus;
  set extractStatus(ExtractStatus? extractStatus) =>
      _$this._extractStatus = extractStatus;

  ExtractAcceptedBuilder() {
    ExtractAccepted._defaults(this);
  }

  ExtractAcceptedBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _extractStatus = $v.extractStatus;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ExtractAccepted other) {
    _$v = other as _$ExtractAccepted;
  }

  @override
  void update(void Function(ExtractAcceptedBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ExtractAccepted build() => _build();

  _$ExtractAccepted _build() {
    final _$result = _$v ??
        _$ExtractAccepted._(
          extractStatus: BuiltValueNullFieldError.checkNotNull(
              extractStatus, r'ExtractAccepted', 'extractStatus'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
