// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Item extends Item {
  @override
  final String id;
  @override
  final String url;
  @override
  final String? canonicalUrl;
  @override
  final String? title;
  @override
  final String? siteName;
  @override
  final String? excerpt;
  @override
  final String? leadImageUrl;
  @override
  final String? faviconUrl;
  @override
  final ItemStatus status;
  @override
  final ExtractStatus extractStatus;
  @override
  final ReadState readState;
  @override
  final bool favorite;
  @override
  final DateTime savedAt;
  @override
  final DateTime? readAt;
  @override
  final BuiltList<String> tags;

  factory _$Item([void Function(ItemBuilder)? updates]) =>
      (ItemBuilder()..update(updates))._build();

  _$Item._(
      {required this.id,
      required this.url,
      this.canonicalUrl,
      this.title,
      this.siteName,
      this.excerpt,
      this.leadImageUrl,
      this.faviconUrl,
      required this.status,
      required this.extractStatus,
      required this.readState,
      required this.favorite,
      required this.savedAt,
      this.readAt,
      required this.tags})
      : super._();
  @override
  Item rebuild(void Function(ItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ItemBuilder toBuilder() => ItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Item &&
        id == other.id &&
        url == other.url &&
        canonicalUrl == other.canonicalUrl &&
        title == other.title &&
        siteName == other.siteName &&
        excerpt == other.excerpt &&
        leadImageUrl == other.leadImageUrl &&
        faviconUrl == other.faviconUrl &&
        status == other.status &&
        extractStatus == other.extractStatus &&
        readState == other.readState &&
        favorite == other.favorite &&
        savedAt == other.savedAt &&
        readAt == other.readAt &&
        tags == other.tags;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, url.hashCode);
    _$hash = $jc(_$hash, canonicalUrl.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, siteName.hashCode);
    _$hash = $jc(_$hash, excerpt.hashCode);
    _$hash = $jc(_$hash, leadImageUrl.hashCode);
    _$hash = $jc(_$hash, faviconUrl.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, extractStatus.hashCode);
    _$hash = $jc(_$hash, readState.hashCode);
    _$hash = $jc(_$hash, favorite.hashCode);
    _$hash = $jc(_$hash, savedAt.hashCode);
    _$hash = $jc(_$hash, readAt.hashCode);
    _$hash = $jc(_$hash, tags.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Item')
          ..add('id', id)
          ..add('url', url)
          ..add('canonicalUrl', canonicalUrl)
          ..add('title', title)
          ..add('siteName', siteName)
          ..add('excerpt', excerpt)
          ..add('leadImageUrl', leadImageUrl)
          ..add('faviconUrl', faviconUrl)
          ..add('status', status)
          ..add('extractStatus', extractStatus)
          ..add('readState', readState)
          ..add('favorite', favorite)
          ..add('savedAt', savedAt)
          ..add('readAt', readAt)
          ..add('tags', tags))
        .toString();
  }
}

class ItemBuilder implements Builder<Item, ItemBuilder> {
  _$Item? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _url;
  String? get url => _$this._url;
  set url(String? url) => _$this._url = url;

  String? _canonicalUrl;
  String? get canonicalUrl => _$this._canonicalUrl;
  set canonicalUrl(String? canonicalUrl) => _$this._canonicalUrl = canonicalUrl;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  String? _siteName;
  String? get siteName => _$this._siteName;
  set siteName(String? siteName) => _$this._siteName = siteName;

  String? _excerpt;
  String? get excerpt => _$this._excerpt;
  set excerpt(String? excerpt) => _$this._excerpt = excerpt;

  String? _leadImageUrl;
  String? get leadImageUrl => _$this._leadImageUrl;
  set leadImageUrl(String? leadImageUrl) => _$this._leadImageUrl = leadImageUrl;

  String? _faviconUrl;
  String? get faviconUrl => _$this._faviconUrl;
  set faviconUrl(String? faviconUrl) => _$this._faviconUrl = faviconUrl;

  ItemStatus? _status;
  ItemStatus? get status => _$this._status;
  set status(ItemStatus? status) => _$this._status = status;

  ExtractStatus? _extractStatus;
  ExtractStatus? get extractStatus => _$this._extractStatus;
  set extractStatus(ExtractStatus? extractStatus) =>
      _$this._extractStatus = extractStatus;

  ReadState? _readState;
  ReadState? get readState => _$this._readState;
  set readState(ReadState? readState) => _$this._readState = readState;

  bool? _favorite;
  bool? get favorite => _$this._favorite;
  set favorite(bool? favorite) => _$this._favorite = favorite;

  DateTime? _savedAt;
  DateTime? get savedAt => _$this._savedAt;
  set savedAt(DateTime? savedAt) => _$this._savedAt = savedAt;

  DateTime? _readAt;
  DateTime? get readAt => _$this._readAt;
  set readAt(DateTime? readAt) => _$this._readAt = readAt;

  ListBuilder<String>? _tags;
  ListBuilder<String> get tags => _$this._tags ??= ListBuilder<String>();
  set tags(ListBuilder<String>? tags) => _$this._tags = tags;

  ItemBuilder() {
    Item._defaults(this);
  }

  ItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _url = $v.url;
      _canonicalUrl = $v.canonicalUrl;
      _title = $v.title;
      _siteName = $v.siteName;
      _excerpt = $v.excerpt;
      _leadImageUrl = $v.leadImageUrl;
      _faviconUrl = $v.faviconUrl;
      _status = $v.status;
      _extractStatus = $v.extractStatus;
      _readState = $v.readState;
      _favorite = $v.favorite;
      _savedAt = $v.savedAt;
      _readAt = $v.readAt;
      _tags = $v.tags.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Item other) {
    _$v = other as _$Item;
  }

  @override
  void update(void Function(ItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Item build() => _build();

  _$Item _build() {
    _$Item _$result;
    try {
      _$result = _$v ??
          _$Item._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'Item', 'id'),
            url: BuiltValueNullFieldError.checkNotNull(url, r'Item', 'url'),
            canonicalUrl: canonicalUrl,
            title: title,
            siteName: siteName,
            excerpt: excerpt,
            leadImageUrl: leadImageUrl,
            faviconUrl: faviconUrl,
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'Item', 'status'),
            extractStatus: BuiltValueNullFieldError.checkNotNull(
                extractStatus, r'Item', 'extractStatus'),
            readState: BuiltValueNullFieldError.checkNotNull(
                readState, r'Item', 'readState'),
            favorite: BuiltValueNullFieldError.checkNotNull(
                favorite, r'Item', 'favorite'),
            savedAt: BuiltValueNullFieldError.checkNotNull(
                savedAt, r'Item', 'savedAt'),
            readAt: readAt,
            tags: tags.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'tags';
        tags.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(r'Item', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
