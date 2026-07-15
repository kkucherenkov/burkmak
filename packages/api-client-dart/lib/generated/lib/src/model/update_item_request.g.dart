// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_item_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UpdateItemRequest extends UpdateItemRequest {
  @override
  final ReadState? readState;
  @override
  final bool? favorite;
  @override
  final Kind? kind;

  factory _$UpdateItemRequest(
          [void Function(UpdateItemRequestBuilder)? updates]) =>
      (UpdateItemRequestBuilder()..update(updates))._build();

  _$UpdateItemRequest._({this.readState, this.favorite, this.kind}) : super._();
  @override
  UpdateItemRequest rebuild(void Function(UpdateItemRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UpdateItemRequestBuilder toBuilder() =>
      UpdateItemRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateItemRequest &&
        readState == other.readState &&
        favorite == other.favorite &&
        kind == other.kind;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, readState.hashCode);
    _$hash = $jc(_$hash, favorite.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateItemRequest')
          ..add('readState', readState)
          ..add('favorite', favorite)
          ..add('kind', kind))
        .toString();
  }
}

class UpdateItemRequestBuilder
    implements Builder<UpdateItemRequest, UpdateItemRequestBuilder> {
  _$UpdateItemRequest? _$v;

  ReadState? _readState;
  ReadState? get readState => _$this._readState;
  set readState(ReadState? readState) => _$this._readState = readState;

  bool? _favorite;
  bool? get favorite => _$this._favorite;
  set favorite(bool? favorite) => _$this._favorite = favorite;

  Kind? _kind;
  Kind? get kind => _$this._kind;
  set kind(Kind? kind) => _$this._kind = kind;

  UpdateItemRequestBuilder() {
    UpdateItemRequest._defaults(this);
  }

  UpdateItemRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _readState = $v.readState;
      _favorite = $v.favorite;
      _kind = $v.kind;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdateItemRequest other) {
    _$v = other as _$UpdateItemRequest;
  }

  @override
  void update(void Function(UpdateItemRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateItemRequest build() => _build();

  _$UpdateItemRequest _build() {
    final _$result = _$v ??
        _$UpdateItemRequest._(
          readState: readState,
          favorite: favorite,
          kind: kind,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
