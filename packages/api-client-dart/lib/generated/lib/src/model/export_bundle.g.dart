// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'export_bundle.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ExportBundle extends ExportBundle {
  @override
  final BuiltList<ExportedNote> notes;

  factory _$ExportBundle([void Function(ExportBundleBuilder)? updates]) =>
      (ExportBundleBuilder()..update(updates))._build();

  _$ExportBundle._({required this.notes}) : super._();
  @override
  ExportBundle rebuild(void Function(ExportBundleBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ExportBundleBuilder toBuilder() => ExportBundleBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ExportBundle && notes == other.notes;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, notes.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ExportBundle')..add('notes', notes))
        .toString();
  }
}

class ExportBundleBuilder
    implements Builder<ExportBundle, ExportBundleBuilder> {
  _$ExportBundle? _$v;

  ListBuilder<ExportedNote>? _notes;
  ListBuilder<ExportedNote> get notes =>
      _$this._notes ??= ListBuilder<ExportedNote>();
  set notes(ListBuilder<ExportedNote>? notes) => _$this._notes = notes;

  ExportBundleBuilder() {
    ExportBundle._defaults(this);
  }

  ExportBundleBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _notes = $v.notes.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ExportBundle other) {
    _$v = other as _$ExportBundle;
  }

  @override
  void update(void Function(ExportBundleBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ExportBundle build() => _build();

  _$ExportBundle _build() {
    _$ExportBundle _$result;
    try {
      _$result = _$v ??
          _$ExportBundle._(
            notes: notes.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'notes';
        notes.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ExportBundle', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
