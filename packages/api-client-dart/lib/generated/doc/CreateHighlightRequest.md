# app_api_client.model.CreateHighlightRequest

## Load the model package
```dart
import 'package:app_api_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**quote** | **String** | The exact text that was highlighted | 
**prefix** | **String** | Short text immediately before the quote (for anchor context) | [optional] 
**suffix** | **String** | Short text immediately after the quote (for anchor context) | [optional] 
**note** | **String** | Optional reader note to attach. To clear a note on an existing highlight, use `PATCH /highlights/{id}` with `note: null` — create only sets a note, it cannot null one.  | [optional] 
**color** | [**HighlightColor**](HighlightColor.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


