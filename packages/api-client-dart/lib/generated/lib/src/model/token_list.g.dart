// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'token_list.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$TokenList extends TokenList {
  @override
  final BuiltList<PersonalAccessToken> tokens;

  factory _$TokenList([void Function(TokenListBuilder)? updates]) =>
      (TokenListBuilder()..update(updates))._build();

  _$TokenList._({required this.tokens}) : super._();
  @override
  TokenList rebuild(void Function(TokenListBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TokenListBuilder toBuilder() => TokenListBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TokenList && tokens == other.tokens;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, tokens.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TokenList')..add('tokens', tokens))
        .toString();
  }
}

class TokenListBuilder implements Builder<TokenList, TokenListBuilder> {
  _$TokenList? _$v;

  ListBuilder<PersonalAccessToken>? _tokens;
  ListBuilder<PersonalAccessToken> get tokens =>
      _$this._tokens ??= ListBuilder<PersonalAccessToken>();
  set tokens(ListBuilder<PersonalAccessToken>? tokens) =>
      _$this._tokens = tokens;

  TokenListBuilder() {
    TokenList._defaults(this);
  }

  TokenListBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _tokens = $v.tokens.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TokenList other) {
    _$v = other as _$TokenList;
  }

  @override
  void update(void Function(TokenListBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TokenList build() => _build();

  _$TokenList _build() {
    _$TokenList _$result;
    try {
      _$result = _$v ??
          _$TokenList._(
            tokens: tokens.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'tokens';
        tokens.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'TokenList', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
