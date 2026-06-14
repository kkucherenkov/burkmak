# app_api_client.api.HighlightsApi

## Load the API package
```dart
import 'package:app_api_client/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createHighlight**](HighlightsApi.md#createhighlight) | **POST** /api/v1/items/{id}/highlights | Create a highlight on an item
[**deleteHighlight**](HighlightsApi.md#deletehighlight) | **DELETE** /api/v1/highlights/{id} | Delete a highlight
[**listHighlights**](HighlightsApi.md#listhighlights) | **GET** /api/v1/items/{id}/highlights | List all highlights on an item
[**updateHighlight**](HighlightsApi.md#updatehighlight) | **PATCH** /api/v1/highlights/{id} | Update a highlight&#39;s note or color


# **createHighlight**
> Highlight createHighlight(id, createHighlightRequest)

Create a highlight on an item

Saves a new text highlight (with optional note and color) on the given item.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getHighlightsApi();
final String id = id_example; // String | Item ID (cuid)
final CreateHighlightRequest createHighlightRequest = {"quote":"Full article body in plain text.","prefix":"Returns the ","suffix":" for the given item.","color":"yellow"}; // CreateHighlightRequest | 

try {
    final response = api.createHighlight(id, createHighlightRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling HighlightsApi->createHighlight: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 
 **createHighlightRequest** | [**CreateHighlightRequest**](CreateHighlightRequest.md)|  | 

### Return type

[**Highlight**](Highlight.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteHighlight**
> deleteHighlight(id)

Delete a highlight

Permanently removes the highlight. This operation cannot be undone.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getHighlightsApi();
final String id = id_example; // String | Highlight ID (cuid)

try {
    api.deleteHighlight(id);
} on DioException catch (e) {
    print('Exception when calling HighlightsApi->deleteHighlight: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Highlight ID (cuid) | 

### Return type

void (empty response body)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listHighlights**
> HighlightList listHighlights(id)

List all highlights on an item

Returns all highlights the authenticated user has created on the given item.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getHighlightsApi();
final String id = id_example; // String | Item ID (cuid)

try {
    final response = api.listHighlights(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling HighlightsApi->listHighlights: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 

### Return type

[**HighlightList**](HighlightList.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateHighlight**
> Highlight updateHighlight(id, updateHighlightRequest)

Update a highlight's note or color

Partially updates a highlight. At least one of `note` or `color` must be provided.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getHighlightsApi();
final String id = id_example; // String | Highlight ID (cuid)
final UpdateHighlightRequest updateHighlightRequest = {"color":"green"}; // UpdateHighlightRequest | 

try {
    final response = api.updateHighlight(id, updateHighlightRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling HighlightsApi->updateHighlight: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Highlight ID (cuid) | 
 **updateHighlightRequest** | [**UpdateHighlightRequest**](UpdateHighlightRequest.md)|  | 

### Return type

[**Highlight**](Highlight.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

