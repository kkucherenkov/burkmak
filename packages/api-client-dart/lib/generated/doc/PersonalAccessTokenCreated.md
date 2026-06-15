# app_api_client.model.PersonalAccessTokenCreated

## Load the model package
```dart
import 'package:app_api_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | Unique token ID (cuid) | 
**name** | **String** | Human-readable label | 
**prefix** | **String** | First ~12 characters for visual identification | 
**token** | **String** | Full plaintext token (`burk_pat_` + 43 base64url chars). Store this value securely — it will not be shown again.  | 
**createdAt** | [**DateTime**](DateTime.md) | ISO-8601 timestamp when the token was created | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


