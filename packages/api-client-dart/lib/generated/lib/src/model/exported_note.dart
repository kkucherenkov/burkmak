//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'exported_note.g.dart';

/// A single item rendered as an Obsidian-ready markdown note.
///
/// Properties:
/// * [itemId] - ID of the source item (cuid); also the `burkmakId` in the note's YAML frontmatter
/// * [title] - Item title (may be null if metadata extraction is not yet complete)
/// * [filename] - Stable, filesystem-safe filename including the `.md` extension (e.g. `the-case-for-reading-slowly-cmqd.md`). Derived from the slugified title + a short id suffix; stable for a given item so the Obsidian plugin can overwrite the same file on re-sync. 
/// * [markdown] - Full markdown content including YAML frontmatter, article metadata, excerpt, and highlight blockquotes. 
@BuiltValue()
abstract class ExportedNote implements Built<ExportedNote, ExportedNoteBuilder> {
  /// ID of the source item (cuid); also the `burkmakId` in the note's YAML frontmatter
  @BuiltValueField(wireName: r'itemId')
  String get itemId;

  /// Item title (may be null if metadata extraction is not yet complete)
  @BuiltValueField(wireName: r'title')
  String? get title;

  /// Stable, filesystem-safe filename including the `.md` extension (e.g. `the-case-for-reading-slowly-cmqd.md`). Derived from the slugified title + a short id suffix; stable for a given item so the Obsidian plugin can overwrite the same file on re-sync. 
  @BuiltValueField(wireName: r'filename')
  String get filename;

  /// Full markdown content including YAML frontmatter, article metadata, excerpt, and highlight blockquotes. 
  @BuiltValueField(wireName: r'markdown')
  String get markdown;

  ExportedNote._();

  factory ExportedNote([void updates(ExportedNoteBuilder b)]) = _$ExportedNote;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ExportedNoteBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ExportedNote> get serializer => _$ExportedNoteSerializer();
}

class _$ExportedNoteSerializer implements PrimitiveSerializer<ExportedNote> {
  @override
  final Iterable<Type> types = const [ExportedNote, _$ExportedNote];

  @override
  final String wireName = r'ExportedNote';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ExportedNote object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'itemId';
    yield serializers.serialize(
      object.itemId,
      specifiedType: const FullType(String),
    );
    yield r'title';
    yield object.title == null ? null : serializers.serialize(
      object.title,
      specifiedType: const FullType.nullable(String),
    );
    yield r'filename';
    yield serializers.serialize(
      object.filename,
      specifiedType: const FullType(String),
    );
    yield r'markdown';
    yield serializers.serialize(
      object.markdown,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ExportedNote object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ExportedNoteBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'itemId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.itemId = valueDes;
          break;
        case r'title':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.title = valueDes;
          break;
        case r'filename':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.filename = valueDes;
          break;
        case r'markdown':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.markdown = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ExportedNote deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ExportedNoteBuilder();
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

