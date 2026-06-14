import 'package:app_mobile/features/item_detail/domain/highlight_inject.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('wraps the quoted text in a colored mark', () {
    final out = injectHighlights('<p>Alpha beta gamma.</p>', [
      const HlAnchor(
        quote: 'beta',
        prefix: 'Alpha ',
        suffix: ' gamma',
        color: 'yellow',
      ),
    ]);
    expect(out, contains('<mark class="hl-yellow">beta</mark>'));
  });

  test('leaves html unchanged when the quote is absent', () {
    final out = injectHighlights('<p>nothing here</p>', [
      const HlAnchor(quote: 'zzz', prefix: '', suffix: '', color: 'green'),
    ]);
    expect(out, '<p>nothing here</p>');
  });

  test('falls back to bare quote when prefix+suffix combo not found', () {
    final out = injectHighlights('<p>some text here</p>', [
      const HlAnchor(
        quote: 'text',
        prefix: 'WRONG ',
        suffix: ' WRONG',
        color: 'blue',
      ),
    ]);
    expect(out, contains('<mark class="hl-blue">text</mark>'));
  });

  test('does not double-wrap already-marked content', () {
    // If html already has the exact mark tag, inject should not double-wrap.
    const html = '<p>Alpha <mark class="hl-yellow">beta</mark> gamma.</p>';
    final out = injectHighlights(html, [
      const HlAnchor(
        quote: 'beta',
        prefix: 'Alpha ',
        suffix: ' gamma',
        color: 'yellow',
      ),
    ]);
    // Should still contain exactly one mark tag, not nested marks.
    expect('<mark'.allMatches(out).length, 1);
  });

  test('injects multiple highlights', () {
    final out = injectHighlights('<p>one two three</p>', [
      const HlAnchor(quote: 'one', prefix: '', suffix: ' two', color: 'pink'),
      const HlAnchor(
        quote: 'three',
        prefix: 'two ',
        suffix: '',
        color: 'green',
      ),
    ]);
    expect(out, contains('<mark class="hl-pink">one</mark>'));
    expect(out, contains('<mark class="hl-green">three</mark>'));
  });
}
