// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'exported_note.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ExportedNote extends ExportedNote {
  @override
  final String itemId;
  @override
  final String? title;
  @override
  final String filename;
  @override
  final String markdown;

  factory _$ExportedNote([void Function(ExportedNoteBuilder)? updates]) =>
      (ExportedNoteBuilder()..update(updates))._build();

  _$ExportedNote._(
      {required this.itemId,
      this.title,
      required this.filename,
      required this.markdown})
      : super._();
  @override
  ExportedNote rebuild(void Function(ExportedNoteBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ExportedNoteBuilder toBuilder() => ExportedNoteBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ExportedNote &&
        itemId == other.itemId &&
        title == other.title &&
        filename == other.filename &&
        markdown == other.markdown;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, itemId.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, filename.hashCode);
    _$hash = $jc(_$hash, markdown.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ExportedNote')
          ..add('itemId', itemId)
          ..add('title', title)
          ..add('filename', filename)
          ..add('markdown', markdown))
        .toString();
  }
}

class ExportedNoteBuilder
    implements Builder<ExportedNote, ExportedNoteBuilder> {
  _$ExportedNote? _$v;

  String? _itemId;
  String? get itemId => _$this._itemId;
  set itemId(String? itemId) => _$this._itemId = itemId;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  String? _filename;
  String? get filename => _$this._filename;
  set filename(String? filename) => _$this._filename = filename;

  String? _markdown;
  String? get markdown => _$this._markdown;
  set markdown(String? markdown) => _$this._markdown = markdown;

  ExportedNoteBuilder() {
    ExportedNote._defaults(this);
  }

  ExportedNoteBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _itemId = $v.itemId;
      _title = $v.title;
      _filename = $v.filename;
      _markdown = $v.markdown;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ExportedNote other) {
    _$v = other as _$ExportedNote;
  }

  @override
  void update(void Function(ExportedNoteBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ExportedNote build() => _build();

  _$ExportedNote _build() {
    final _$result = _$v ??
        _$ExportedNote._(
          itemId: BuiltValueNullFieldError.checkNotNull(
              itemId, r'ExportedNote', 'itemId'),
          title: title,
          filename: BuiltValueNullFieldError.checkNotNull(
              filename, r'ExportedNote', 'filename'),
          markdown: BuiltValueNullFieldError.checkNotNull(
              markdown, r'ExportedNote', 'markdown'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
