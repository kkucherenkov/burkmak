# app_api_client.api.ItemsApi

## Load the API package
```dart
import 'package:app_api_client/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addItemTag**](ItemsApi.md#additemtag) | **POST** /api/v1/items/{id}/tags | Add a tag to an item (creates the tag if it does not exist)
[**deleteItem**](ItemsApi.md#deleteitem) | **DELETE** /api/v1/items/{id} | Permanently delete an item
[**getItem**](ItemsApi.md#getitem) | **GET** /api/v1/items/{id} | Fetch a single item by ID
[**listItems**](ItemsApi.md#listitems) | **GET** /api/v1/items | List saved items with optional filtering
[**removeItemTag**](ItemsApi.md#removeitemtag) | **DELETE** /api/v1/items/{id}/tags/{tagSlug} | Remove a tag from an item
[**saveItem**](ItemsApi.md#saveitem) | **POST** /api/v1/items | Save a new URL to the reading list
[**updateItem**](ItemsApi.md#updateitem) | **PATCH** /api/v1/items/{id} | Update read state or favourite flag on an item


# **addItemTag**
> Item addItemTag(id, addTagRequest)

Add a tag to an item (creates the tag if it does not exist)

Attaches a tag to the item by slug. If the tag does not yet exist for this user it is created automatically and a slug is derived from the provided name.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getItemsApi();
final String id = id_example; // String | Item ID (cuid)
final AddTagRequest addTagRequest = {"tag":"tech"}; // AddTagRequest | 

try {
    final response = api.addItemTag(id, addTagRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ItemsApi->addItemTag: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 
 **addTagRequest** | [**AddTagRequest**](AddTagRequest.md)|  | 

### Return type

[**Item**](Item.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteItem**
> deleteItem(id)

Permanently delete an item

Permanently removes the item and all its tag associations. This operation cannot be undone.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getItemsApi();
final String id = id_example; // String | Item ID (cuid)

try {
    api.deleteItem(id);
} on DioException catch (e) {
    print('Exception when calling ItemsApi->deleteItem: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 

### Return type

void (empty response body)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getItem**
> Item getItem(id)

Fetch a single item by ID

Returns the full item record for the given ID, scoped to the authenticated user.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getItemsApi();
final String id = id_example; // String | Item ID (cuid)

try {
    final response = api.getItem(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ItemsApi->getItem: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 

### Return type

[**Item**](Item.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listItems**
> ItemList listItems(readState, kind, tag, shelf, favorite, q, cursor, limit)

List saved items with optional filtering

Returns a cursor-paginated list of the authenticated user's saved items. Supports filtering by read state, tag, favourite flag, full-text search, and kind.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getItemsApi();
final ReadState readState = ; // ReadState | Filter by read state
final Kind kind = ; // Kind | Filter by kind (article or bookmark). Omit to return all kinds.
final String tag = tag_example; // String | Filter by tag slug
final String shelf = shelf_example; // String | Only items on this shelf (shelf ID)
final bool favorite = true; // bool | Filter to favourites only
final String q = q_example; // String | Full-text search query
final String cursor = cursor_example; // String | Opaque cursor for the next page
final int limit = 56; // int | Number of items to return (1–100, default 20)

try {
    final response = api.listItems(readState, kind, tag, shelf, favorite, q, cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ItemsApi->listItems: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **readState** | [**ReadState**](.md)| Filter by read state | [optional] 
 **kind** | [**Kind**](.md)| Filter by kind (article or bookmark). Omit to return all kinds. | [optional] 
 **tag** | **String**| Filter by tag slug | [optional] 
 **shelf** | **String**| Only items on this shelf (shelf ID) | [optional] 
 **favorite** | **bool**| Filter to favourites only | [optional] 
 **q** | **String**| Full-text search query | [optional] 
 **cursor** | **String**| Opaque cursor for the next page | [optional] 
 **limit** | **int**| Number of items to return (1–100, default 20) | [optional] [default to 20]

### Return type

[**ItemList**](ItemList.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **removeItemTag**
> removeItemTag(id, tagSlug)

Remove a tag from an item

Detaches the specified tag from the item. The tag record itself is not deleted; use `DELETE /api/v1/tags/{id}` for that.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getItemsApi();
final String id = id_example; // String | Item ID (cuid)
final String tagSlug = tagSlug_example; // String | Tag slug to remove

try {
    api.removeItemTag(id, tagSlug);
} on DioException catch (e) {
    print('Exception when calling ItemsApi->removeItemTag: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 
 **tagSlug** | **String**| Tag slug to remove | 

### Return type

void (empty response body)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **saveItem**
> Item saveItem(saveItemRequest)

Save a new URL to the reading list

Creates an item with status `pending`. A background job is dispatched to fetch metadata (title, excerpt, images). The item becomes `ready` or `failed` asynchronously.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getItemsApi();
final SaveItemRequest saveItemRequest = {"url":"https://example.com/article","tags":["tech"]}; // SaveItemRequest | 

try {
    final response = api.saveItem(saveItemRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ItemsApi->saveItem: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **saveItemRequest** | [**SaveItemRequest**](SaveItemRequest.md)|  | 

### Return type

[**Item**](Item.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateItem**
> Item updateItem(id, updateItemRequest)

Update read state or favourite flag on an item

Partially updates an item. At least one of `readState` or `favorite` must be provided. Setting `readState` to `read` for the first time records `readAt`.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getItemsApi();
final String id = id_example; // String | Item ID (cuid)
final UpdateItemRequest updateItemRequest = {"readState":"read"}; // UpdateItemRequest | 

try {
    final response = api.updateItem(id, updateItemRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ItemsApi->updateItem: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 
 **updateItemRequest** | [**UpdateItemRequest**](UpdateItemRequest.md)|  | 

### Return type

[**Item**](Item.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

