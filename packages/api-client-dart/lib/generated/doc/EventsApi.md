# app_api_client.api.EventsApi

## Load the API package
```dart
import 'package:app_api_client/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**streamEvents**](EventsApi.md#streamevents) | **GET** /api/v1/events | Server-Sent Events stream of the caller&#39;s item and job updates


# **streamEvents**
> String streamEvents()

Server-Sent Events stream of the caller's item and job updates

Long-lived `text/event-stream` connection. Each message is a JSON payload `{ \"type\": ..., \"data\": ... }` describing an item or job change for the authenticated user. A periodic `ping` event acts as a heartbeat. Requires an active Better Auth session. 

### Example
```dart
import 'package:app_api_client/api.dart';
// TODO Configure API key authorization: cookieAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('cookieAuth').apiKeyPrefix = 'Bearer';

final api = AppApiClient().getEventsApi();

try {
    final response = api.streamEvents();
    print(response);
} on DioException catch (e) {
    print('Exception when calling EventsApi->streamEvents: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**String**

### Authorization

[cookieAuth](../README.md#cookieAuth), [bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/event-stream, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

