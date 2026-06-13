# app_api_client.api.TagsApi

## Load the API package
```dart
import 'package:app_api_client/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**deleteTag**](TagsApi.md#deletetag) | **DELETE** /api/v1/tags/{id} | Delete a tag and remove it from all items
[**listTags**](TagsApi.md#listtags) | **GET** /api/v1/tags | List all tags for the authenticated user
[**renameTag**](TagsApi.md#renametag) | **PATCH** /api/v1/tags/{id} | Rename a tag (updates name; slug is re-derived server-side)


# **deleteTag**
> deleteTag(id)

Delete a tag and remove it from all items

Permanently deletes the tag and cascades removal from all items that carry it. This operation cannot be undone.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getTagsApi();
final String id = id_example; // String | Tag ID (cuid)

try {
    api.deleteTag(id);
} on DioException catch (e) {
    print('Exception when calling TagsApi->deleteTag: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Tag ID (cuid) | 

### Return type

void (empty response body)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listTags**
> TagList listTags()

List all tags for the authenticated user

Returns every tag that belongs to the authenticated user, ordered by name, with a count of associated items.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getTagsApi();

try {
    final response = api.listTags();
    print(response);
} on DioException catch (e) {
    print('Exception when calling TagsApi->listTags: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**TagList**](TagList.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **renameTag**
> renameTag(id, renameTagRequest)

Rename a tag (updates name; slug is re-derived server-side)

Updates the display name of a tag. The slug is automatically re-derived from the new name server-side.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getTagsApi();
final String id = id_example; // String | Tag ID (cuid)
final RenameTagRequest renameTagRequest = {"name":"Technology"}; // RenameTagRequest | 

try {
    api.renameTag(id, renameTagRequest);
} on DioException catch (e) {
    print('Exception when calling TagsApi->renameTag: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Tag ID (cuid) | 
 **renameTagRequest** | [**RenameTagRequest**](RenameTagRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

