// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#custom-getters-and-methods');

UserModel _$UserModelFromJson(Map<String, dynamic> json) {
  return _UserModel.fromJson(json);
}

/// @nodoc
mixin _$UserModel {
  String? get displayName => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get imageUrl => throw _privateConstructorUsedError;
  String get uid => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get dateCreated => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserModelCopyWith<UserModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserModelCopyWith<$Res> {
  factory $UserModelCopyWith(UserModel value, $Res Function(UserModel) then) =
      _$UserModelCopyWithImpl<$Res, UserModel>;
  @useResult
  $Res call(
      {String? displayName,
      String? email,
      String? imageUrl,
      String uid,
      @TimestampConverter() DateTime? dateCreated});
}

/// @nodoc
class _$UserModelCopyWithImpl<$Res, $Val extends UserModel>
    implements $UserModelCopyWith<$Res> {
  _$UserModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? displayName = freezed,
    Object? email = freezed,
    Object? imageUrl = freezed,
    Object? uid = null,
    Object? dateCreated = freezed,
  }) {
    return _then(_value.copyWith(
      displayName: freezed == displayName
          ? _value.displayName
          : displayName // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      uid: null == uid
          ? _value.uid
          : uid // ignore: cast_nullable_to_non_nullable
              as String,
      dateCreated: freezed == dateCreated
          ? _value.dateCreated
          : dateCreated // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_UserModelCopyWith<$Res> implements $UserModelCopyWith<$Res> {
  factory _$$_UserModelCopyWith(
          _$_UserModel value, $Res Function(_$_UserModel) then) =
      __$$_UserModelCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String? displayName,
      String? email,
      String? imageUrl,
      String uid,
      @TimestampConverter() DateTime? dateCreated});
}

/// @nodoc
class __$$_UserModelCopyWithImpl<$Res>
    extends _$UserModelCopyWithImpl<$Res, _$_UserModel>
    implements _$$_UserModelCopyWith<$Res> {
  __$$_UserModelCopyWithImpl(
      _$_UserModel _value, $Res Function(_$_UserModel) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? displayName = freezed,
    Object? email = freezed,
    Object? imageUrl = freezed,
    Object? uid = null,
    Object? dateCreated = freezed,
  }) {
    return _then(_$_UserModel(
      displayName: freezed == displayName
          ? _value.displayName
          : displayName // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      uid: null == uid
          ? _value.uid
          : uid // ignore: cast_nullable_to_non_nullable
              as String,
      dateCreated: freezed == dateCreated
          ? _value.dateCreated
          : dateCreated // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_UserModel implements _UserModel {
  const _$_UserModel(
      {this.displayName,
      this.email,
      this.imageUrl,
      required this.uid,
      @TimestampConverter() this.dateCreated});

  factory _$_UserModel.fromJson(Map<String, dynamic> json) =>
      _$$_UserModelFromJson(json);

  @override
  final String? displayName;
  @override
  final String? email;
  @override
  final String? imageUrl;
  @override
  final String uid;
  @override
  @TimestampConverter()
  final DateTime? dateCreated;

  @override
  String toString() {
    return 'UserModel(displayName: $displayName, email: $email, imageUrl: $imageUrl, uid: $uid, dateCreated: $dateCreated)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_UserModel &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.uid, uid) || other.uid == uid) &&
            (identical(other.dateCreated, dateCreated) ||
                other.dateCreated == dateCreated));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode =>
      Object.hash(runtimeType, displayName, email, imageUrl, uid, dateCreated);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_UserModelCopyWith<_$_UserModel> get copyWith =>
      __$$_UserModelCopyWithImpl<_$_UserModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_UserModelToJson(
      this,
    );
  }
}

abstract class _UserModel implements UserModel {
  const factory _UserModel(
      {final String? displayName,
      final String? email,
      final String? imageUrl,
      required final String uid,
      @TimestampConverter() final DateTime? dateCreated}) = _$_UserModel;

  factory _UserModel.fromJson(Map<String, dynamic> json) =
      _$_UserModel.fromJson;

  @override
  String? get displayName;
  @override
  String? get email;
  @override
  String? get imageUrl;
  @override
  String get uid;
  @override
  @TimestampConverter()
  DateTime? get dateCreated;
  @override
  @JsonKey(ignore: true)
  _$$_UserModelCopyWith<_$_UserModel> get copyWith =>
      throw _privateConstructorUsedError;
}

CurrentUserModel _$CurrentUserModelFromJson(Map<String, dynamic> json) {
  return _CurrentUserModel.fromJson(json);
}

/// @nodoc
mixin _$CurrentUserModel {
  String? get displayName => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get imageUrl => throw _privateConstructorUsedError;
  String? get publicAddress => throw _privateConstructorUsedError;
  String get uid => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $CurrentUserModelCopyWith<CurrentUserModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CurrentUserModelCopyWith<$Res> {
  factory $CurrentUserModelCopyWith(
          CurrentUserModel value, $Res Function(CurrentUserModel) then) =
      _$CurrentUserModelCopyWithImpl<$Res, CurrentUserModel>;
  @useResult
  $Res call(
      {String? displayName,
      String? email,
      String? imageUrl,
      String? publicAddress,
      String uid});
}

/// @nodoc
class _$CurrentUserModelCopyWithImpl<$Res, $Val extends CurrentUserModel>
    implements $CurrentUserModelCopyWith<$Res> {
  _$CurrentUserModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? displayName = freezed,
    Object? email = freezed,
    Object? imageUrl = freezed,
    Object? publicAddress = freezed,
    Object? uid = null,
  }) {
    return _then(_value.copyWith(
      displayName: freezed == displayName
          ? _value.displayName
          : displayName // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      publicAddress: freezed == publicAddress
          ? _value.publicAddress
          : publicAddress // ignore: cast_nullable_to_non_nullable
              as String?,
      uid: null == uid
          ? _value.uid
          : uid // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_CurrentUserModelCopyWith<$Res>
    implements $CurrentUserModelCopyWith<$Res> {
  factory _$$_CurrentUserModelCopyWith(
          _$_CurrentUserModel value, $Res Function(_$_CurrentUserModel) then) =
      __$$_CurrentUserModelCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String? displayName,
      String? email,
      String? imageUrl,
      String? publicAddress,
      String uid});
}

/// @nodoc
class __$$_CurrentUserModelCopyWithImpl<$Res>
    extends _$CurrentUserModelCopyWithImpl<$Res, _$_CurrentUserModel>
    implements _$$_CurrentUserModelCopyWith<$Res> {
  __$$_CurrentUserModelCopyWithImpl(
      _$_CurrentUserModel _value, $Res Function(_$_CurrentUserModel) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? displayName = freezed,
    Object? email = freezed,
    Object? imageUrl = freezed,
    Object? publicAddress = freezed,
    Object? uid = null,
  }) {
    return _then(_$_CurrentUserModel(
      displayName: freezed == displayName
          ? _value.displayName
          : displayName // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      publicAddress: freezed == publicAddress
          ? _value.publicAddress
          : publicAddress // ignore: cast_nullable_to_non_nullable
              as String?,
      uid: null == uid
          ? _value.uid
          : uid // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_CurrentUserModel implements _CurrentUserModel {
  const _$_CurrentUserModel(
      {this.displayName,
      this.email,
      this.imageUrl,
      this.publicAddress,
      required this.uid});

  factory _$_CurrentUserModel.fromJson(Map<String, dynamic> json) =>
      _$$_CurrentUserModelFromJson(json);

  @override
  final String? displayName;
  @override
  final String? email;
  @override
  final String? imageUrl;
  @override
  final String? publicAddress;
  @override
  final String uid;

  @override
  String toString() {
    return 'CurrentUserModel(displayName: $displayName, email: $email, imageUrl: $imageUrl, publicAddress: $publicAddress, uid: $uid)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_CurrentUserModel &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.publicAddress, publicAddress) ||
                other.publicAddress == publicAddress) &&
            (identical(other.uid, uid) || other.uid == uid));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType, displayName, email, imageUrl, publicAddress, uid);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_CurrentUserModelCopyWith<_$_CurrentUserModel> get copyWith =>
      __$$_CurrentUserModelCopyWithImpl<_$_CurrentUserModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_CurrentUserModelToJson(
      this,
    );
  }
}

abstract class _CurrentUserModel implements CurrentUserModel {
  const factory _CurrentUserModel(
      {final String? displayName,
      final String? email,
      final String? imageUrl,
      final String? publicAddress,
      required final String uid}) = _$_CurrentUserModel;

  factory _CurrentUserModel.fromJson(Map<String, dynamic> json) =
      _$_CurrentUserModel.fromJson;

  @override
  String? get displayName;
  @override
  String? get email;
  @override
  String? get imageUrl;
  @override
  String? get publicAddress;
  @override
  String get uid;
  @override
  @JsonKey(ignore: true)
  _$$_CurrentUserModelCopyWith<_$_CurrentUserModel> get copyWith =>
      throw _privateConstructorUsedError;
}
