// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'article.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Article extends Article {
  @override
  final String contentHtml;
  @override
  final String contentText;
  @override
  final int wordCount;
  @override
  final int readingTimeMin;
  @override
  final DateTime extractedAt;

  factory _$Article([void Function(ArticleBuilder)? updates]) =>
      (ArticleBuilder()..update(updates))._build();

  _$Article._(
      {required this.contentHtml,
      required this.contentText,
      required this.wordCount,
      required this.readingTimeMin,
      required this.extractedAt})
      : super._();
  @override
  Article rebuild(void Function(ArticleBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ArticleBuilder toBuilder() => ArticleBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Article &&
        contentHtml == other.contentHtml &&
        contentText == other.contentText &&
        wordCount == other.wordCount &&
        readingTimeMin == other.readingTimeMin &&
        extractedAt == other.extractedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, contentHtml.hashCode);
    _$hash = $jc(_$hash, contentText.hashCode);
    _$hash = $jc(_$hash, wordCount.hashCode);
    _$hash = $jc(_$hash, readingTimeMin.hashCode);
    _$hash = $jc(_$hash, extractedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Article')
          ..add('contentHtml', contentHtml)
          ..add('contentText', contentText)
          ..add('wordCount', wordCount)
          ..add('readingTimeMin', readingTimeMin)
          ..add('extractedAt', extractedAt))
        .toString();
  }
}

class ArticleBuilder implements Builder<Article, ArticleBuilder> {
  _$Article? _$v;

  String? _contentHtml;
  String? get contentHtml => _$this._contentHtml;
  set contentHtml(String? contentHtml) => _$this._contentHtml = contentHtml;

  String? _contentText;
  String? get contentText => _$this._contentText;
  set contentText(String? contentText) => _$this._contentText = contentText;

  int? _wordCount;
  int? get wordCount => _$this._wordCount;
  set wordCount(int? wordCount) => _$this._wordCount = wordCount;

  int? _readingTimeMin;
  int? get readingTimeMin => _$this._readingTimeMin;
  set readingTimeMin(int? readingTimeMin) =>
      _$this._readingTimeMin = readingTimeMin;

  DateTime? _extractedAt;
  DateTime? get extractedAt => _$this._extractedAt;
  set extractedAt(DateTime? extractedAt) => _$this._extractedAt = extractedAt;

  ArticleBuilder() {
    Article._defaults(this);
  }

  ArticleBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _contentHtml = $v.contentHtml;
      _contentText = $v.contentText;
      _wordCount = $v.wordCount;
      _readingTimeMin = $v.readingTimeMin;
      _extractedAt = $v.extractedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Article other) {
    _$v = other as _$Article;
  }

  @override
  void update(void Function(ArticleBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Article build() => _build();

  _$Article _build() {
    final _$result = _$v ??
        _$Article._(
          contentHtml: BuiltValueNullFieldError.checkNotNull(
              contentHtml, r'Article', 'contentHtml'),
          contentText: BuiltValueNullFieldError.checkNotNull(
              contentText, r'Article', 'contentText'),
          wordCount: BuiltValueNullFieldError.checkNotNull(
              wordCount, r'Article', 'wordCount'),
          readingTimeMin: BuiltValueNullFieldError.checkNotNull(
              readingTimeMin, r'Article', 'readingTimeMin'),
          extractedAt: BuiltValueNullFieldError.checkNotNull(
              extractedAt, r'Article', 'extractedAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
