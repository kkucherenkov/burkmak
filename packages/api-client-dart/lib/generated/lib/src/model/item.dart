//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:app_api_client/src/model/item_status.dart';
import 'package:built_collection/built_collection.dart';
import 'package:app_api_client/src/model/shelf_summary.dart';
import 'package:app_api_client/src/model/read_state.dart';
import 'package:app_api_client/src/model/kind.dart';
import 'package:app_api_client/src/model/extract_status.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'item.g.dart';

/// Item
///
/// Properties:
/// * [id] - Unique item ID (cuid)
/// * [url] - Original URL submitted by the user
/// * [kind] 
/// * [canonicalUrl] - Canonical URL resolved during metadata extraction
/// * [title] - Page title
/// * [siteName] - Name of the publishing site
/// * [excerpt] - Short plain-text excerpt
/// * [leadImageUrl] - Hero/lead image URL
/// * [faviconUrl] - Site favicon URL
/// * [status] 
/// * [extractStatus] 
/// * [readState] 
/// * [favorite] - Whether the item is marked as a favourite
/// * [savedAt] - ISO-8601 timestamp when the item was saved
/// * [readAt] - ISO-8601 timestamp when the item was first marked read
/// * [tags] - Slugs of tags attached to this item
/// * [shelves] - Shelves this item belongs to
@BuiltValue()
abstract class Item implements Built<Item, ItemBuilder> {
  /// Unique item ID (cuid)
  @BuiltValueField(wireName: r'id')
  String get id;

  /// Original URL submitted by the user
  @BuiltValueField(wireName: r'url')
  String get url;

  @BuiltValueField(wireName: r'kind')
  Kind get kind;
  // enum kindEnum {  article,  bookmark,  };

  /// Canonical URL resolved during metadata extraction
  @BuiltValueField(wireName: r'canonicalUrl')
  String? get canonicalUrl;

  /// Page title
  @BuiltValueField(wireName: r'title')
  String? get title;

  /// Name of the publishing site
  @BuiltValueField(wireName: r'siteName')
  String? get siteName;

  /// Short plain-text excerpt
  @BuiltValueField(wireName: r'excerpt')
  String? get excerpt;

  /// Hero/lead image URL
  @BuiltValueField(wireName: r'leadImageUrl')
  String? get leadImageUrl;

  /// Site favicon URL
  @BuiltValueField(wireName: r'faviconUrl')
  String? get faviconUrl;

  @BuiltValueField(wireName: r'status')
  ItemStatus get status;
  // enum statusEnum {  pending,  ready,  failed,  };

  @BuiltValueField(wireName: r'extractStatus')
  ExtractStatus get extractStatus;
  // enum extractStatusEnum {  none,  extracting,  ready,  failed,  };

  @BuiltValueField(wireName: r'readState')
  ReadState get readState;
  // enum readStateEnum {  unread,  read,  archived,  };

  /// Whether the item is marked as a favourite
  @BuiltValueField(wireName: r'favorite')
  bool get favorite;

  /// ISO-8601 timestamp when the item was saved
  @BuiltValueField(wireName: r'savedAt')
  DateTime get savedAt;

  /// ISO-8601 timestamp when the item was first marked read
  @BuiltValueField(wireName: r'readAt')
  DateTime? get readAt;

  /// Slugs of tags attached to this item
  @BuiltValueField(wireName: r'tags')
  BuiltList<String> get tags;

  /// Shelves this item belongs to
  @BuiltValueField(wireName: r'shelves')
  BuiltList<ShelfSummary> get shelves;

  Item._();

  factory Item([void updates(ItemBuilder b)]) = _$Item;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Item> get serializer => _$ItemSerializer();
}

class _$ItemSerializer implements PrimitiveSerializer<Item> {
  @override
  final Iterable<Type> types = const [Item, _$Item];

  @override
  final String wireName = r'Item';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Item object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'url';
    yield serializers.serialize(
      object.url,
      specifiedType: const FullType(String),
    );
    yield r'kind';
    yield serializers.serialize(
      object.kind,
      specifiedType: const FullType(Kind),
    );
    if (object.canonicalUrl != null) {
      yield r'canonicalUrl';
      yield serializers.serialize(
        object.canonicalUrl,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.title != null) {
      yield r'title';
      yield serializers.serialize(
        object.title,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.siteName != null) {
      yield r'siteName';
      yield serializers.serialize(
        object.siteName,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.excerpt != null) {
      yield r'excerpt';
      yield serializers.serialize(
        object.excerpt,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.leadImageUrl != null) {
      yield r'leadImageUrl';
      yield serializers.serialize(
        object.leadImageUrl,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.faviconUrl != null) {
      yield r'faviconUrl';
      yield serializers.serialize(
        object.faviconUrl,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(ItemStatus),
    );
    yield r'extractStatus';
    yield serializers.serialize(
      object.extractStatus,
      specifiedType: const FullType(ExtractStatus),
    );
    yield r'readState';
    yield serializers.serialize(
      object.readState,
      specifiedType: const FullType(ReadState),
    );
    yield r'favorite';
    yield serializers.serialize(
      object.favorite,
      specifiedType: const FullType(bool),
    );
    yield r'savedAt';
    yield serializers.serialize(
      object.savedAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.readAt != null) {
      yield r'readAt';
      yield serializers.serialize(
        object.readAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'tags';
    yield serializers.serialize(
      object.tags,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'shelves';
    yield serializers.serialize(
      object.shelves,
      specifiedType: const FullType(BuiltList, [FullType(ShelfSummary)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    Item object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ItemBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'url':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.url = valueDes;
          break;
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Kind),
          ) as Kind;
          result.kind = valueDes;
          break;
        case r'canonicalUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.canonicalUrl = valueDes;
          break;
        case r'title':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.title = valueDes;
          break;
        case r'siteName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.siteName = valueDes;
          break;
        case r'excerpt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.excerpt = valueDes;
          break;
        case r'leadImageUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.leadImageUrl = valueDes;
          break;
        case r'faviconUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.faviconUrl = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ItemStatus),
          ) as ItemStatus;
          result.status = valueDes;
          break;
        case r'extractStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ExtractStatus),
          ) as ExtractStatus;
          result.extractStatus = valueDes;
          break;
        case r'readState':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ReadState),
          ) as ReadState;
          result.readState = valueDes;
          break;
        case r'favorite':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.favorite = valueDes;
          break;
        case r'savedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.savedAt = valueDes;
          break;
        case r'readAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.readAt = valueDes;
          break;
        case r'tags':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.tags.replace(valueDes);
          break;
        case r'shelves':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ShelfSummary)]),
          ) as BuiltList<ShelfSummary>;
          result.shelves.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Item deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ItemBuilder();
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

