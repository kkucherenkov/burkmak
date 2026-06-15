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
> String getOpdsFeed()

OPDS 1.2 acquisition feed of extracted articles

Returns an OPDS 1.2 Atom acquisition feed listing the authenticated user's extracted articles (newest first; `extractStatus = ready`; excludes archived items by default). Each `<entry>` carries an acquisition link pointing at `GET /api/v1/items/{id}/epub`.  Kobo and other OPDS readers should be pointed at this URL with HTTP Basic authentication — any non-empty username, PAT as the password. The response content-type is `application/atom+xml;profile=opds-catalog;kind=acquisition`. 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure HTTP basic authorization: patBasicAuth
//defaultApiClient.getAuthentication<HttpBasicAuth>('patBasicAuth').username = 'YOUR_USERNAME'
//defaultApiClient.getAuthentication<HttpBasicAuth>('patBasicAuth').password = 'YOUR_PASSWORD';

final api = AppApiClient().getKoboApi();

try {
    final response = api.getOpdsFeed();
    print(response);
} on DioException catch (e) {
    print('Exception when calling KoboApi->getOpdsFeed: $e\n');
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
 - **Accept**: application/atom+xml, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

