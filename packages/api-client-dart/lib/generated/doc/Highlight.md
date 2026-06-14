# app_api_client.model.Highlight

## Load the model package
```dart
import 'package:app_api_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | Unique highlight ID (cuid) | 
**itemId** | **String** | ID of the item this highlight belongs to (cuid) | 
**quote** | **String** | The exact text that was highlighted | 
**prefix** | **String** | Short text immediately before the highlighted quote (for anchor context) | 
**suffix** | **String** | Short text immediately after the highlighted quote (for anchor context) | 
**note** | **String** | Optional reader note attached to the highlight | [optional] 
**color** | [**HighlightColor**](HighlightColor.md) |  | 
**createdAt** | [**DateTime**](DateTime.md) | ISO-8601 timestamp when the highlight was created | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


