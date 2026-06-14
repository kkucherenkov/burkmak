/// Holds a shared URL captured while the user was signed out, so it can be
/// saved once they authenticate. Single-slot: a newer share replaces an older.
class PendingShareStore {
  String? _url;

  void set(String url) => _url = url;

  /// Returns the held URL and clears it (consume-once).
  String? take() {
    final url = _url;
    _url = null;
    return url;
  }
}
