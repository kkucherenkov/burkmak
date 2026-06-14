# app_api_client.api.ExtractionApi

## Load the API package
```dart
import 'package:app_api_client/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**extractArticle**](ExtractionApi.md#extractarticle) | **POST** /api/v1/items/{id}/extract | Trigger article content extraction for an item
[**getArticle**](ExtractionApi.md#getarticle) | **GET** /api/v1/items/{id}/article | Get extracted article content for an item
[**getItemImage**](ExtractionApi.md#getitemimage) | **GET** /api/v1/items/{id}/image/{key} | Retrieve a cached image associated with an item


# **extractArticle**
> ExtractAccepted extractArticle(id)

Trigger article content extraction for an item

Idempotent: always returns 202 and (re)starts extraction, replacing any existing article. No request body. Safe to call in any `extractStatus` state (`none`, `failed`, or `ready`). The item's `extractStatus` transitions to `extracting` immediately and becomes `ready` or `failed` asynchronously. 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getExtractionApi();
final String id = id_example; // String | Item ID (cuid)

try {
    final response = api.extractArticle(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ExtractionApi->extractArticle: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 

### Return type

[**ExtractAccepted**](ExtractAccepted.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getArticle**
> Article getArticle(id)

Get extracted article content for an item

Returns the full extracted article body (HTML and plain text) for the given item. Returns 404 if the article has not been extracted yet.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getExtractionApi();
final String id = id_example; // String | Item ID (cuid)

try {
    final response = api.getArticle(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ExtractionApi->getArticle: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 

### Return type

[**Article**](Article.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getItemImage**
> Uint8List getItemImage(id, key)

Retrieve a cached image associated with an item

Streams a cached image file that was downloaded during article extraction. Returns 404 if the image key does not exist or is not owned by the authenticated user.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getExtractionApi();
final String id = id_example; // String | Item ID (cuid)
final String key = key_example; // String | Opaque image key assigned by the extraction job. Clients MUST NOT construct this value: the extraction job rewrites `<img src>` URLs inside `Article.contentHtml` to `/api/v1/items/{id}/image/{key}` paths, so clients only ever follow keys that already appear in the article HTML. 

try {
    final response = api.getItemImage(id, key);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ExtractionApi->getItemImage: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 
 **key** | **String**| Opaque image key assigned by the extraction job. Clients MUST NOT construct this value: the extraction job rewrites `<img src>` URLs inside `Article.contentHtml` to `/api/v1/items/{id}/image/{key}` paths, so clients only ever follow keys that already appear in the article HTML.  | 

### Return type

[**Uint8List**](Uint8List.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: image/jpeg, image/png, image/webp, application/octet-stream, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

