# app_api_client.api.TokensApi

## Load the API package
```dart
import 'package:app_api_client/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createToken**](TokensApi.md#createtoken) | **POST** /api/v1/tokens | Create a personal access token
[**listTokens**](TokensApi.md#listtokens) | **GET** /api/v1/tokens | List the authenticated user&#39;s personal access tokens
[**revokeToken**](TokensApi.md#revoketoken) | **DELETE** /api/v1/tokens/{id} | Revoke a personal access token


# **createToken**
> PersonalAccessTokenCreated createToken(createTokenRequest)

Create a personal access token

Creates a new personal access token for the authenticated user and returns the **full plaintext secret exactly once** — it is not stored and cannot be retrieved again. The caller must copy it immediately.  The token string has the format `burk_pat_` followed by 43 base64url characters (32 random bytes). It can be used as: - `Authorization: Bearer <token>` (Obsidian, REST clients) - HTTP Basic password, any username (OPDS/Kobo clients) 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getTokensApi();
final CreateTokenRequest createTokenRequest = {"name":"Kobo e-reader"}; // CreateTokenRequest | 

try {
    final response = api.createToken(createTokenRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling TokensApi->createToken: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createTokenRequest** | [**CreateTokenRequest**](CreateTokenRequest.md)|  | 

### Return type

[**PersonalAccessTokenCreated**](PersonalAccessTokenCreated.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listTokens**
> TokenList listTokens()

List the authenticated user's personal access tokens

Returns all non-revoked personal access tokens for the authenticated user. The secret and hash are **never** returned; only the display prefix is included for identification. 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getTokensApi();

try {
    final response = api.listTokens();
    print(response);
} on DioException catch (e) {
    print('Exception when calling TokensApi->listTokens: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**TokenList**](TokenList.md)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **revokeToken**
> revokeToken(id)

Revoke a personal access token

Permanently revokes the token by recording a `revokedAt` timestamp. Returns `404` if the token does not exist or is not owned by the authenticated user. Immediately invalidates the token; in-flight requests using the token may still succeed if they passed the auth check before revocation. 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getTokensApi();
final String id = id_example; // String | Personal access token ID (cuid)

try {
    api.revokeToken(id);
} on DioException catch (e) {
    print('Exception when calling TokensApi->revokeToken: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| Personal access token ID (cuid) | 

### Return type

void (empty response body)

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

