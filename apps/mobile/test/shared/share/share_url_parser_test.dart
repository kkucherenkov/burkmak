import 'package:app_mobile/shared/share/share_url_parser.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('extractFirstUrl', () {
    test('returns a bare url unchanged', () {
      expect(extractFirstUrl('https://example.com/a'), 'https://example.com/a');
    });

    test('pulls the url out of surrounding share text', () {
      expect(
        extractFirstUrl('Check this out https://example.com/a?b=1 great read'),
        'https://example.com/a?b=1',
      );
    });

    test('accepts http and https only', () {
      expect(extractFirstUrl('ftp://example.com'), isNull);
      expect(extractFirstUrl('just some text'), isNull);
      expect(extractFirstUrl(''), isNull);
    });

    test('trims whitespace', () {
      expect(extractFirstUrl('  https://example.com  '), 'https://example.com');
    });
  });
}
