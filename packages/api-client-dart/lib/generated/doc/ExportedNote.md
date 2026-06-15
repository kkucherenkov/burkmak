# app_api_client.model.ExportedNote

## Load the model package
```dart
import 'package:app_api_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**itemId** | **String** | ID of the source item (cuid); also the `burkmakId` in the note's YAML frontmatter | 
**title** | **String** | Item title (may be null if metadata extraction is not yet complete) | 
**filename** | **String** | Stable, filesystem-safe filename including the `.md` extension (e.g. `the-case-for-reading-slowly-cmqd.md`). Derived from the slugified title + a short id suffix; stable for a given item so the Obsidian plugin can overwrite the same file on re-sync.  | 
**markdown** | **String** | Full markdown content including YAML frontmatter, article metadata, excerpt, and highlight blockquotes.  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


