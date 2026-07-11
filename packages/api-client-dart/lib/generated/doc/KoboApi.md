# app_api_client.api.KoboApi

## Load the API package
```dart
import 'package:app_api_client/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getItemEpub**](KoboApi.md#getitemepub) | **GET** /api/v1/items/{id}/epub | Download an EPUB/KEPUB for a saved item
[**getOpdsFeed**](KoboApi.md#getopdsfeed) | **GET** /api/v1/opds | OPDS 1.2 acquisition feed of extracted articles
[**getOpdsOpenSearch**](KoboApi.md#getopdsopensearch) | **GET** /api/v1/opds/opensearch.xml | OpenSearch description document for the OPDS catalog


# **getItemEpub**
> Uint8List getItemEpub(id)

Download an EPUB/KEPUB for a saved item

Builds (or returns a cached) EPUB3/KEPUB for the item's extracted article and streams it as `application/epub+zip`. The file is a `.kepub.epub` for optimal on-device progress tracking on Kobo.  Requires a ready article (`extractStatus = ready`). Returns `409` if the article has not been extracted yet. Accepts session cookie, Better Auth bearer, **and** PAT HTTP Basic (password = `burk_pat_…`) so that OPDS/Kobo acquisition links work without an interactive session. 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';
// TODO Configure HTTP basic authorization: patBasicAuth
//defaultApiClient.getAuthentication<HttpBasicAuth>('patBasicAuth').username = 'YOUR_USERNAME'
//defaultApiClient.getAuthentication<HttpBasicAuth>('patBasicAuth').password = 'YOUR_PASSWORD';

final api = AppApiClient().getKoboApi();
final String id = id_example; // String | Item ID (cuid)

try {
    final response = api.getItemEpub(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling KoboApi->getItemEpub: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Item ID (cuid) | 

### Return type

[**Uint8List**](Uint8List.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [patBasicAuth](../README.md#patBasicAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/epub+zip, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getOpdsFeed**
> String getOpdsFeed(cursor, q)

OPDS 1.2 acquisition feed of extracted articles

Returns an OPDS 1.2 Atom acquisition feed listing the authenticated user's extracted articles (newest first; `extractStatus = ready`; excludes archived items by default). Each `<entry>` carries an acquisition link pointing at `GET /api/v1/items/{id}/epub`.  Kobo and other OPDS readers should be pointed at this URL with HTTP Basic authentication — any non-empty username, PAT as the password. The response content-type is `application/atom+xml;profile=opds-catalog;kind=acquisition`.  Entries carry `http://opds-spec.org/image` (+ `/image/thumbnail`) links when a cover is known — the first cached content image, served by `GET /api/v1/items/{id}/image/{key}` with the same credentials, or the remote lead image as a fallback. The feed paginates via a `rel=\"next\"` link (page size 50) and advertises OpenSearch via a `rel=\"search\"` link. 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure HTTP basic authorization: patBasicAuth
//defaultApiClient.getAuthentication<HttpBasicAuth>('patBasicAuth').username = 'YOUR_USERNAME'
//defaultApiClient.getAuthentication<HttpBasicAuth>('patBasicAuth').password = 'YOUR_PASSWORD';

final api = AppApiClient().getKoboApi();
final String cursor = cursor_example; // String | Opaque pagination cursor from the previous page's `rel=\"next\"` link. Unknown or stale cursors fall back to the first page — OPDS devices are hard to debug, so the feed never 400s on paging. 
final String q = q_example; // String | Full-text search term (same semantics as the library `q` filter). Used by the OpenSearch template; empty result is a valid empty feed. 

try {
    final response = api.getOpdsFeed(cursor, q);
    print(response);
} on DioException catch (e) {
    print('Exception when calling KoboApi->getOpdsFeed: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cursor** | **String**| Opaque pagination cursor from the previous page's `rel=\"next\"` link. Unknown or stale cursors fall back to the first page — OPDS devices are hard to debug, so the feed never 400s on paging.  | [optional] 
 **q** | **String**| Full-text search term (same semantics as the library `q` filter). Used by the OpenSearch template; empty result is a valid empty feed.  | [optional] 

### Return type

**String**

### Authorization

[patBasicAuth](../README.md#patBasicAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/atom+xml, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getOpdsOpenSearch**
> String getOpdsOpenSearch()

OpenSearch description document for the OPDS catalog

Returns an OpenSearch 1.1 description document advertising the OPDS search endpoint (`GET /api/v1/opds?q={searchTerms}`). OPDS clients discover this document through the feed's `rel=\"search\"` link and use it to power their built-in catalog search UI. 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure HTTP basic authorization: patBasicAuth
//defaultApiClient.getAuthentication<HttpBasicAuth>('patBasicAuth').username = 'YOUR_USERNAME'
//defaultApiClient.getAuthentication<HttpBasicAuth>('patBasicAuth').password = 'YOUR_PASSWORD';

final api = AppApiClient().getKoboApi();

try {
    final response = api.getOpdsOpenSearch();
    print(response);
} on DioException catch (e) {
    print('Exception when calling KoboApi->getOpdsOpenSearch: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**String**

### Authorization

[patBasicAuth](../README.md#patBasicAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/opensearchdescription+xml, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

