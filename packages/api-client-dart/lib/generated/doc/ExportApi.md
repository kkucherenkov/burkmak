# app_api_client.api.ExportApi

## Load the API package
```dart
import 'package:app_api_client/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**exportItemMarkdown**](ExportApi.md#exportitemmarkdown) | **GET** /api/v1/items/{id}/export/markdown | Export a single item as a raw markdown note
[**exportMarkdownBundle**](ExportApi.md#exportmarkdownbundle) | **GET** /api/v1/export/markdown | Export all matching items as Obsidian-ready markdown notes


# **exportItemMarkdown**
> String exportItemMarkdown(id)

Export a single item as a raw markdown note

Returns the Obsidian-ready markdown for a single item as `text/markdown`. Useful for manual copy-paste or testing the renderer. The markdown format is identical to entries returned by `GET /api/v1/export/markdown`. Returns `404` if the item does not exist or is not owned by the caller. 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getExportApi();
final String id = id_example; // String | Item ID (cuid)

try {
    final response = api.exportItemMarkdown(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ExportApi->exportItemMarkdown: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 

### Return type

**String**

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/markdown, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **exportMarkdownBundle**
> ExportBundle exportMarkdownBundle(readState, since, includeEmpty)

Export all matching items as Obsidian-ready markdown notes

Returns a JSON bundle of markdown-rendered notes for the authenticated user's items. By default only items with at least one highlight are included. Use `?includeEmpty=true` to include items without highlights. Supports filtering by read state and a `since` cursor (items whose metadata or highlights changed after that timestamp). Results are ordered newest-first.  Designed to be consumed by the Obsidian plugin; each `ExportedNote` contains a stable `filename` and a YAML-frontmatter block whose `burkmakId` is the idempotency key for vault writes. 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getExportApi();
final ReadState readState = ; // ReadState | Filter by read state
final DateTime since = 2013-10-20T19:20:30+01:00; // DateTime | ISO-8601 timestamp; only items updated at or after this instant are returned. Useful for incremental sync. 
final bool includeEmpty = true; // bool | When `false` (default) only items with at least one highlight are returned. Set to `true` to include items without highlights. 

try {
    final response = api.exportMarkdownBundle(readState, since, includeEmpty);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ExportApi->exportMarkdownBundle: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **readState** | [**ReadState**](.md)| Filter by read state | [optional] 
 **since** | **DateTime**| ISO-8601 timestamp; only items updated at or after this instant are returned. Useful for incremental sync.  | [optional] 
 **includeEmpty** | **bool**| When `false` (default) only items with at least one highlight are returned. Set to `true` to include items without highlights.  | [optional] [default to false]

### Return type

[**ExportBundle**](ExportBundle.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

