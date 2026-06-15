import 'package:test/test.dart';
import 'package:app_api_client/app_api_client.dart';


/// tests for KoboApi
void main() {
  final instance = AppApiClient().getKoboApi();

  group(KoboApi, () {
    // Download an EPUB/KEPUB for a saved item
    //
    // Builds (or returns a cached) EPUB3/KEPUB for the item's extracted article and streams it as `application/epub+zip`. The file is a `.kepub.epub` for optimal on-device progress tracking on Kobo.  Requires a ready article (`extractStatus = ready`). Returns `409` if the article has not been extracted yet. Accepts session cookie, Better Auth bearer, **and** PAT HTTP Basic (password = `burk_pat_…`) so that OPDS/Kobo acquisition links work without an interactive session. 
    //
    //Future<Uint8List> getItemEpub(String id) async
    test('test getItemEpub', () async {
      // TODO
    });

    // OPDS 1.2 acquisition feed of extracted articles
    //
    // Returns an OPDS 1.2 Atom acquisition feed listing the authenticated user's extracted articles (newest first; `extractStatus = ready`; excludes archived items by default). Each `<entry>` carries an acquisition link pointing at `GET /api/v1/items/{id}/epub`.  Kobo and other OPDS readers should be pointed at this URL with HTTP Basic authentication — any non-empty username, PAT as the password. The response content-type is `application/atom+xml;profile=opds-catalog;kind=acquisition`. 
    //
    //Future<String> getOpdsFeed() async
    test('test getOpdsFeed', () async {
      // TODO
    });

  });
}
