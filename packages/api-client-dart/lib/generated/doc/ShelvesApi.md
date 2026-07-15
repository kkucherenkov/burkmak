# app_api_client.api.ShelvesApi

## Load the API package
```dart
import 'package:app_api_client/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addItemToShelf**](ShelvesApi.md#additemtoshelf) | **PUT** /api/v1/shelves/{id}/items/{itemId} | Add an item to a shelf (idempotent)
[**createShelf**](ShelvesApi.md#createshelf) | **POST** /api/v1/shelves | Create a shelf
[**deleteShelf**](ShelvesApi.md#deleteshelf) | **DELETE** /api/v1/shelves/{id} | Delete a shelf
[**listShelves**](ShelvesApi.md#listshelves) | **GET** /api/v1/shelves | List shelves with item counts
[**removeItemFromShelf**](ShelvesApi.md#removeitemfromshelf) | **DELETE** /api/v1/shelves/{id}/items/{itemId} | Remove an item from a shelf
[**renameShelf**](ShelvesApi.md#renameshelf) | **PATCH** /api/v1/shelves/{id} | Rename a shelf


# **addItemToShelf**
> addItemToShelf(id, itemId)

Add an item to a shelf (idempotent)

Adds the item to the shelf. Idempotent — calling again when the item is already on the shelf is a no-op.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getShelvesApi();
final String id = id_example; // String | Shelf ID (uuid)
final String itemId = itemId_example; // String | Item ID (cuid)

try {
    api.addItemToShelf(id, itemId);
} on DioException catch (e) {
    print('Exception when calling ShelvesApi->addItemToShelf: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Shelf ID (uuid) | 
 **itemId** | **String**| Item ID (cuid) | 

### Return type

void (empty response body)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createShelf**
> Shelf createShelf(createShelfRequest)

Create a shelf

Creates a new shelf owned by the authenticated user. Shelf names must be unique per user.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getShelvesApi();
final CreateShelfRequest createShelfRequest = {"name":"Deep Reads"}; // CreateShelfRequest | 

try {
    final response = api.createShelf(createShelfRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ShelvesApi->createShelf: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createShelfRequest** | [**CreateShelfRequest**](CreateShelfRequest.md)|  | 

### Return type

[**Shelf**](Shelf.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteShelf**
> deleteShelf(id)

Delete a shelf

Permanently deletes the shelf. Items that were on the shelf are not deleted.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getShelvesApi();
final String id = id_example; // String | Shelf ID (uuid)

try {
    api.deleteShelf(id);
} on DioException catch (e) {
    print('Exception when calling ShelvesApi->deleteShelf: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Shelf ID (uuid) | 

### Return type

void (empty response body)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listShelves**
> ShelfList listShelves()

List shelves with item counts

Returns all shelves belonging to the authenticated user, each with its current item count.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getShelvesApi();

try {
    final response = api.listShelves();
    print(response);
} on DioException catch (e) {
    print('Exception when calling ShelvesApi->listShelves: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ShelfList**](ShelfList.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **removeItemFromShelf**
> removeItemFromShelf(id, itemId)

Remove an item from a shelf

Removes the item from the shelf. Does not delete the item or the shelf.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getShelvesApi();
final String id = id_example; // String | Shelf ID (uuid)
final String itemId = itemId_example; // String | Item ID (cuid)

try {
    api.removeItemFromShelf(id, itemId);
} on DioException catch (e) {
    print('Exception when calling ShelvesApi->removeItemFromShelf: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Shelf ID (uuid) | 
 **itemId** | **String**| Item ID (cuid) | 

### Return type

void (empty response body)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **renameShelf**
> Shelf renameShelf(id, renameShelfRequest)

Rename a shelf

Renames the shelf and bumps `lastModified`. Returns 404 if the shelf does not exist or is not owned by the authenticated user.

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getShelvesApi();
final String id = id_example; // String | Shelf ID (uuid)
final RenameShelfRequest renameShelfRequest = {"name":"Long-form Reading"}; // RenameShelfRequest | 

try {
    final response = api.renameShelf(id, renameShelfRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ShelvesApi->renameShelf: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Shelf ID (uuid) | 
 **renameShelfRequest** | [**RenameShelfRequest**](RenameShelfRequest.md)|  | 

### Return type

[**Shelf**](Shelf.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

