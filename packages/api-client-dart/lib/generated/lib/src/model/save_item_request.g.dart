// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'save_item_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SaveItemRequest extends SaveItemRequest {
  @override
  final String url;
  @override
  final BuiltList<String>? tags;
  @override
  final Kind? kind;

  factory _$SaveItemRequest([void Function(SaveItemRequestBuilder)? updates]) =>
      (SaveItemRequestBuilder()..update(updates))._build();

  _$SaveItemRequest._({required this.url, this.tags, this.kind}) : super._();
  @override
  SaveItemRequest rebuild(void Function(SaveItemRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SaveItemRequestBuilder toBuilder() => SaveItemRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SaveItemRequest &&
        url == other.url &&
        tags == other.tags &&
        kind == other.kind;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, url.hashCode);
    _$hash = $jc(_$hash, tags.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SaveItemRequest')
          ..add('url', url)
          ..add('tags', tags)
          ..add('kind', kind))
        .toString();
  }
}

class SaveItemRequestBuilder
    implements Builder<SaveItemRequest, SaveItemRequestBuilder> {
  _$SaveItemRequest? _$v;

  String? _url;
  String? get url => _$this._url;
  set url(String? url) => _$this._url = url;

  ListBuilder<String>? _tags;
  ListBuilder<String> get tags => _$this._tags ??= ListBuilder<String>();
  set tags(ListBuilder<String>? tags) => _$this._tags = tags;

  Kind? _kind;
  Kind? get kind => _$this._kind;
  set kind(Kind? kind) => _$this._kind = kind;

  SaveItemRequestBuilder() {
    SaveItemRequest._defaults(this);
  }

  SaveItemRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _url = $v.url;
      _tags = $v.tags?.toBuilder();
      _kind = $v.kind;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SaveItemRequest other) {
    _$v = other as _$SaveItemRequest;
  }

  @override
  void update(void Function(SaveItemRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SaveItemRequest build() => _build();

  _$SaveItemRequest _build() {
    _$SaveItemRequest _$result;
    try {
      _$result = _$v ??
          _$SaveItemRequest._(
            url: BuiltValueNullFieldError.checkNotNull(
                url, r'SaveItemRequest', 'url'),
            tags: _tags?.build(),
            kind: kind,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'tags';
        _tags?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SaveItemRequest', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
