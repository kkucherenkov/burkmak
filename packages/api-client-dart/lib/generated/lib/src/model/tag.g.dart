// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'tag.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Tag extends Tag {
  @override
  final String id;
  @override
  final String name;
  @override
  final String slug;
  @override
  final int count;

  factory _$Tag([void Function(TagBuilder)? updates]) =>
      (TagBuilder()..update(updates))._build();

  _$Tag._(
      {required this.id,
      required this.name,
      required this.slug,
      required this.count})
      : super._();
  @override
  Tag rebuild(void Function(TagBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TagBuilder toBuilder() => TagBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Tag &&
        id == other.id &&
        name == other.name &&
        slug == other.slug &&
        count == other.count;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, slug.hashCode);
    _$hash = $jc(_$hash, count.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Tag')
          ..add('id', id)
          ..add('name', name)
          ..add('slug', slug)
          ..add('count', count))
        .toString();
  }
}

class TagBuilder implements Builder<Tag, TagBuilder> {
  _$Tag? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _slug;
  String? get slug => _$this._slug;
  set slug(String? slug) => _$this._slug = slug;

  int? _count;
  int? get count => _$this._count;
  set count(int? count) => _$this._count = count;

  TagBuilder() {
    Tag._defaults(this);
  }

  TagBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _slug = $v.slug;
      _count = $v.count;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Tag other) {
    _$v = other as _$Tag;
  }

  @override
  void update(void Function(TagBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Tag build() => _build();

  _$Tag _build() {
    final _$result = _$v ??
        _$Tag._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'Tag', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(name, r'Tag', 'name'),
          slug: BuiltValueNullFieldError.checkNotNull(slug, r'Tag', 'slug'),
          count: BuiltValueNullFieldError.checkNotNull(count, r'Tag', 'count'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
