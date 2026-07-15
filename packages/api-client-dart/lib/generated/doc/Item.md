# app_api_client.model.Item

## Load the model package
```dart
import 'package:app_api_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | Unique item ID (cuid) | 
**url** | **String** | Original URL submitted by the user | 
**kind** | [**Kind**](Kind.md) |  | 
**canonicalUrl** | **String** | Canonical URL resolved during metadata extraction | [optional] 
**title** | **String** | Page title | [optional] 
**siteName** | **String** | Name of the publishing site | [optional] 
**excerpt** | **String** | Short plain-text excerpt | [optional] 
**leadImageUrl** | **String** | Hero/lead image URL | [optional] 
**faviconUrl** | **String** | Site favicon URL | [optional] 
**status** | [**ItemStatus**](ItemStatus.md) |  | 
**extractStatus** | [**ExtractStatus**](ExtractStatus.md) |  | 
**readState** | [**ReadState**](ReadState.md) |  | 
**favorite** | **bool** | Whether the item is marked as a favourite | 
**savedAt** | [**DateTime**](DateTime.md) | ISO-8601 timestamp when the item was saved | 
**readAt** | [**DateTime**](DateTime.md) | ISO-8601 timestamp when the item was first marked read | [optional] 
**tags** | **BuiltList&lt;String&gt;** | Slugs of tags attached to this item | 
**shelves** | [**BuiltList&lt;ShelfSummary&gt;**](ShelfSummary.md) | Shelves this item belongs to | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


