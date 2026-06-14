//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'article.g.dart';

/// Article
///
/// Properties:
/// * [contentHtml] - Full article body as HTML
/// * [contentText] - Full article body as plain text (HTML stripped)
/// * [wordCount] - Number of words in the extracted article
/// * [readingTimeMin] - Estimated reading time in minutes
/// * [extractedAt] - ISO-8601 timestamp when the extraction completed
@BuiltValue()
abstract class Article implements Built<Article, ArticleBuilder> {
  /// Full article body as HTML
  @BuiltValueField(wireName: r'contentHtml')
  String get contentHtml;

  /// Full article body as plain text (HTML stripped)
  @BuiltValueField(wireName: r'contentText')
  String get contentText;

  /// Number of words in the extracted article
  @BuiltValueField(wireName: r'wordCount')
  int get wordCount;

  /// Estimated reading time in minutes
  @BuiltValueField(wireName: r'readingTimeMin')
  int get readingTimeMin;

  /// ISO-8601 timestamp when the extraction completed
  @BuiltValueField(wireName: r'extractedAt')
  DateTime get extractedAt;

  Article._();

  factory Article([void updates(ArticleBuilder b)]) = _$Article;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ArticleBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Article> get serializer => _$ArticleSerializer();
}

class _$ArticleSerializer implements PrimitiveSerializer<Article> {
  @override
  final Iterable<Type> types = const [Article, _$Article];

  @override
  final String wireName = r'Article';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Article object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'contentHtml';
    yield serializers.serialize(
      object.contentHtml,
      specifiedType: const FullType(String),
    );
    yield r'contentText';
    yield serializers.serialize(
      object.contentText,
      specifiedType: const FullType(String),
    );
    yield r'wordCount';
    yield serializers.serialize(
      object.wordCount,
      specifiedType: const FullType(int),
    );
    yield r'readingTimeMin';
    yield serializers.serialize(
      object.readingTimeMin,
      specifiedType: const FullType(int),
    );
    yield r'extractedAt';
    yield serializers.serialize(
      object.extractedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    Article object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ArticleBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'contentHtml':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.contentHtml = valueDes;
          break;
        case r'contentText':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.contentText = valueDes;
          break;
        case r'wordCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.wordCount = valueDes;
          break;
        case r'readingTimeMin':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.readingTimeMin = valueDes;
          break;
        case r'extractedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.extractedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Article deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ArticleBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

