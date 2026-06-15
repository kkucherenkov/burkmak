# app_api_client.model.PersonalAccessToken

## Load the model package
```dart
import 'package:app_api_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | Unique token ID (cuid) | 
**name** | **String** | Human-readable label assigned at creation | 
**prefix** | **String** | First ~12 characters of the token for visual identification (e.g. \"burk_pat_ab12\") | 
**lastUsedAt** | [**DateTime**](DateTime.md) | ISO-8601 timestamp of the most recent successful use; null if never used | [optional] 
**createdAt** | [**DateTime**](DateTime.md) | ISO-8601 timestamp when the token was created | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


