// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'tag_list.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$TagList extends TagList {
  @override
  final BuiltList<Tag> tags;

  factory _$TagList([void Function(TagListBuilder)? updates]) =>
      (TagListBuilder()..update(updates))._build();

  _$TagList._({required this.tags}) : super._();
  @override
  TagList rebuild(void Function(TagListBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TagListBuilder toBuilder() => TagListBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TagList && tags == other.tags;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, tags.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TagList')..add('tags', tags))
        .toString();
  }
}

class TagListBuilder implements Builder<TagList, TagListBuilder> {
  _$TagList? _$v;

  ListBuilder<Tag>? _tags;
  ListBuilder<Tag> get tags => _$this._tags ??= ListBuilder<Tag>();
  set tags(ListBuilder<Tag>? tags) => _$this._tags = tags;

  TagListBuilder() {
    TagList._defaults(this);
  }

  TagListBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _tags = $v.tags.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TagList other) {
    _$v = other as _$TagList;
  }

  @override
  void update(void Function(TagListBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TagList build() => _build();

  _$TagList _build() {
    _$TagList _$result;
    try {
      _$result = _$v ??
          _$TagList._(
            tags: tags.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'tags';
        tags.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'TagList', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
