import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';


/// tests for EventsApi
void main() {
  final instance = AppApiClient().getEventsApi();

  group(EventsApi, () {
    // Server-Sent Events stream of the caller's item and job updates
    //
    // Long-lived `text/event-stream` connection. Each message is a JSON payload `{ \"type\": ..., \"data\": ... }` describing an item or job change for the authenticated user. A periodic `ping` event acts as a heartbeat. Requires an active Better Auth session. 
    //
    //Future<String> streamEvents() async
    test('test streamEvents', () async {
      // TODO
    });

  });
}
