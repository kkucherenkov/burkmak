// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'add_tag_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AddTagRequest extends AddTagRequest {
  @override
  final String tag;

  factory _$AddTagRequest([void Function(AddTagRequestBuilder)? updates]) =>
      (AddTagRequestBuilder()..update(updates))._build();

  _$AddTagRequest._({required this.tag}) : super._();
  @override
  AddTagRequest rebuild(void Function(AddTagRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AddTagRequestBuilder toBuilder() => AddTagRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AddTagRequest && tag == other.tag;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, tag.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AddTagRequest')..add('tag', tag))
        .toString();
  }
}

class AddTagRequestBuilder
    implements Builder<AddTagRequest, AddTagRequestBuilder> {
  _$AddTagRequest? _$v;

  String? _tag;
  String? get tag => _$this._tag;
  set tag(String? tag) => _$this._tag = tag;

  AddTagRequestBuilder() {
    AddTagRequest._defaults(this);
  }

  AddTagRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _tag = $v.tag;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AddTagRequest other) {
    _$v = other as _$AddTagRequest;
  }

  @override
  void update(void Function(AddTagRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AddTagRequest build() => _build();

  _$AddTagRequest _build() {
    final _$result = _$v ??
        _$AddTagRequest._(
          tag: BuiltValueNullFieldError.checkNotNull(
              tag, r'AddTagRequest', 'tag'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
