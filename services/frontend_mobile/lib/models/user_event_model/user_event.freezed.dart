// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#custom-getters-and-methods');

UserRegistrationEvent _$UserRegistrationEventFromJson(
    Map<String, dynamic> json) {
  return _UserRegistrationEvent.fromJson(json);
}

/// @nodoc
mixin _$UserRegistrationEvent {
  String get email => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  bool get social => throw _privateConstructorUsedError;
  String? get socialType => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get timestamp => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserRegistrationEventCopyWith<UserRegistrationEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserRegistrationEventCopyWith<$Res> {
  factory $UserRegistrationEventCopyWith(UserRegistrationEvent value,
          $Res Function(UserRegistrationEvent) then) =
      _$UserRegistrationEventCopyWithImpl<$Res, UserRegistrationEvent>;
  @useResult
  $Res call(
      {String email,
      String status,
      bool social,
      String? socialType,
      @TimestampConverter() DateTime? timestamp});
}

/// @nodoc
class _$UserRegistrationEventCopyWithImpl<$Res,
        $Val extends UserRegistrationEvent>
    implements $UserRegistrationEventCopyWith<$Res> {
  _$UserRegistrationEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? email = null,
    Object? status = null,
    Object? social = null,
    Object? socialType = freezed,
    Object? timestamp = freezed,
  }) {
    return _then(_value.copyWith(
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      social: null == social
          ? _value.social
          : social // ignore: cast_nullable_to_non_nullable
              as bool,
      socialType: freezed == socialType
          ? _value.socialType
          : socialType // ignore: cast_nullable_to_non_nullable
              as String?,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_UserRegistrationEventCopyWith<$Res>
    implements $UserRegistrationEventCopyWith<$Res> {
  factory _$$_UserRegistrationEventCopyWith(_$_UserRegistrationEvent value,
          $Res Function(_$_UserRegistrationEvent) then) =
      __$$_UserRegistrationEventCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String email,
      String status,
      bool social,
      String? socialType,
      @TimestampConverter() DateTime? timestamp});
}

/// @nodoc
class __$$_UserRegistrationEventCopyWithImpl<$Res>
    extends _$UserRegistrationEventCopyWithImpl<$Res, _$_UserRegistrationEvent>
    implements _$$_UserRegistrationEventCopyWith<$Res> {
  __$$_UserRegistrationEventCopyWithImpl(_$_UserRegistrationEvent _value,
      $Res Function(_$_UserRegistrationEvent) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? email = null,
    Object? status = null,
    Object? social = null,
    Object? socialType = freezed,
    Object? timestamp = freezed,
  }) {
    return _then(_$_UserRegistrationEvent(
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      social: null == social
          ? _value.social
          : social // ignore: cast_nullable_to_non_nullable
              as bool,
      socialType: freezed == socialType
          ? _value.socialType
          : socialType // ignore: cast_nullable_to_non_nullable
              as String?,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_UserRegistrationEvent implements _UserRegistrationEvent {
  const _$_UserRegistrationEvent(
      {required this.email,
      required this.status,
      required this.social,
      this.socialType,
      @TimestampConverter() this.timestamp});

  factory _$_UserRegistrationEvent.fromJson(Map<String, dynamic> json) =>
      _$$_UserRegistrationEventFromJson(json);

  @override
  final String email;
  @override
  final String status;
  @override
  final bool social;
  @override
  final String? socialType;
  @override
  @TimestampConverter()
  final DateTime? timestamp;

  @override
  String toString() {
    return 'UserRegistrationEvent(email: $email, status: $status, social: $social, socialType: $socialType, timestamp: $timestamp)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_UserRegistrationEvent &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.social, social) || other.social == social) &&
            (identical(other.socialType, socialType) ||
                other.socialType == socialType) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode =>
      Object.hash(runtimeType, email, status, social, socialType, timestamp);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_UserRegistrationEventCopyWith<_$_UserRegistrationEvent> get copyWith =>
      __$$_UserRegistrationEventCopyWithImpl<_$_UserRegistrationEvent>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_UserRegistrationEventToJson(
      this,
    );
  }
}

abstract class _UserRegistrationEvent implements UserRegistrationEvent {
  const factory _UserRegistrationEvent(
          {required final String email,
          required final String status,
          required final bool social,
          final String? socialType,
          @TimestampConverter() final DateTime? timestamp}) =
      _$_UserRegistrationEvent;

  factory _UserRegistrationEvent.fromJson(Map<String, dynamic> json) =
      _$_UserRegistrationEvent.fromJson;

  @override
  String get email;
  @override
  String get status;
  @override
  bool get social;
  @override
  String? get socialType;
  @override
  @TimestampConverter()
  DateTime? get timestamp;
  @override
  @JsonKey(ignore: true)
  _$$_UserRegistrationEventCopyWith<_$_UserRegistrationEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

UserSignInEvent _$UserSignInEventFromJson(Map<String, dynamic> json) {
  return _UserSignInEvent.fromJson(json);
}

/// @nodoc
mixin _$UserSignInEvent {
  String get status => throw _privateConstructorUsedError;
  bool get social => throw _privateConstructorUsedError;
  String? get social_type => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get timestamp => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserSignInEventCopyWith<UserSignInEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserSignInEventCopyWith<$Res> {
  factory $UserSignInEventCopyWith(
          UserSignInEvent value, $Res Function(UserSignInEvent) then) =
      _$UserSignInEventCopyWithImpl<$Res, UserSignInEvent>;
  @useResult
  $Res call(
      {String status,
      bool social,
      String? social_type,
      @TimestampConverter() DateTime? timestamp});
}

/// @nodoc
class _$UserSignInEventCopyWithImpl<$Res, $Val extends UserSignInEvent>
    implements $UserSignInEventCopyWith<$Res> {
  _$UserSignInEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? status = null,
    Object? social = null,
    Object? social_type = freezed,
    Object? timestamp = freezed,
  }) {
    return _then(_value.copyWith(
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      social: null == social
          ? _value.social
          : social // ignore: cast_nullable_to_non_nullable
              as bool,
      social_type: freezed == social_type
          ? _value.social_type
          : social_type // ignore: cast_nullable_to_non_nullable
              as String?,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_UserSignInEventCopyWith<$Res>
    implements $UserSignInEventCopyWith<$Res> {
  factory _$$_UserSignInEventCopyWith(
          _$_UserSignInEvent value, $Res Function(_$_UserSignInEvent) then) =
      __$$_UserSignInEventCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String status,
      bool social,
      String? social_type,
      @TimestampConverter() DateTime? timestamp});
}

/// @nodoc
class __$$_UserSignInEventCopyWithImpl<$Res>
    extends _$UserSignInEventCopyWithImpl<$Res, _$_UserSignInEvent>
    implements _$$_UserSignInEventCopyWith<$Res> {
  __$$_UserSignInEventCopyWithImpl(
      _$_UserSignInEvent _value, $Res Function(_$_UserSignInEvent) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? status = null,
    Object? social = null,
    Object? social_type = freezed,
    Object? timestamp = freezed,
  }) {
    return _then(_$_UserSignInEvent(
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      social: null == social
          ? _value.social
          : social // ignore: cast_nullable_to_non_nullable
              as bool,
      social_type: freezed == social_type
          ? _value.social_type
          : social_type // ignore: cast_nullable_to_non_nullable
              as String?,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_UserSignInEvent implements _UserSignInEvent {
  const _$_UserSignInEvent(
      {required this.status,
      required this.social,
      this.social_type,
      @TimestampConverter() this.timestamp});

  factory _$_UserSignInEvent.fromJson(Map<String, dynamic> json) =>
      _$$_UserSignInEventFromJson(json);

  @override
  final String status;
  @override
  final bool social;
  @override
  final String? social_type;
  @override
  @TimestampConverter()
  final DateTime? timestamp;

  @override
  String toString() {
    return 'UserSignInEvent(status: $status, social: $social, social_type: $social_type, timestamp: $timestamp)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_UserSignInEvent &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.social, social) || other.social == social) &&
            (identical(other.social_type, social_type) ||
                other.social_type == social_type) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode =>
      Object.hash(runtimeType, status, social, social_type, timestamp);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_UserSignInEventCopyWith<_$_UserSignInEvent> get copyWith =>
      __$$_UserSignInEventCopyWithImpl<_$_UserSignInEvent>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_UserSignInEventToJson(
      this,
    );
  }
}

abstract class _UserSignInEvent implements UserSignInEvent {
  const factory _UserSignInEvent(
      {required final String status,
      required final bool social,
      final String? social_type,
      @TimestampConverter() final DateTime? timestamp}) = _$_UserSignInEvent;

  factory _UserSignInEvent.fromJson(Map<String, dynamic> json) =
      _$_UserSignInEvent.fromJson;

  @override
  String get status;
  @override
  bool get social;
  @override
  String? get social_type;
  @override
  @TimestampConverter()
  DateTime? get timestamp;
  @override
  @JsonKey(ignore: true)
  _$$_UserSignInEventCopyWith<_$_UserSignInEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

UserWalletConnectedEvent _$UserWalletConnectedEventFromJson(
    Map<String, dynamic> json) {
  return _UserWalletConnectedEvent.fromJson(json);
}

/// @nodoc
mixin _$UserWalletConnectedEvent {
  String get status => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get timestamp => throw _privateConstructorUsedError;
  String get user_id => throw _privateConstructorUsedError;
  String get wallet_type => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserWalletConnectedEventCopyWith<UserWalletConnectedEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserWalletConnectedEventCopyWith<$Res> {
  factory $UserWalletConnectedEventCopyWith(UserWalletConnectedEvent value,
          $Res Function(UserWalletConnectedEvent) then) =
      _$UserWalletConnectedEventCopyWithImpl<$Res, UserWalletConnectedEvent>;
  @useResult
  $Res call(
      {String status,
      @TimestampConverter() DateTime? timestamp,
      String user_id,
      String wallet_type});
}

/// @nodoc
class _$UserWalletConnectedEventCopyWithImpl<$Res,
        $Val extends UserWalletConnectedEvent>
    implements $UserWalletConnectedEventCopyWith<$Res> {
  _$UserWalletConnectedEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? status = null,
    Object? timestamp = freezed,
    Object? user_id = null,
    Object? wallet_type = null,
  }) {
    return _then(_value.copyWith(
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      wallet_type: null == wallet_type
          ? _value.wallet_type
          : wallet_type // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_UserWalletConnectedEventCopyWith<$Res>
    implements $UserWalletConnectedEventCopyWith<$Res> {
  factory _$$_UserWalletConnectedEventCopyWith(
          _$_UserWalletConnectedEvent value,
          $Res Function(_$_UserWalletConnectedEvent) then) =
      __$$_UserWalletConnectedEventCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String status,
      @TimestampConverter() DateTime? timestamp,
      String user_id,
      String wallet_type});
}

/// @nodoc
class __$$_UserWalletConnectedEventCopyWithImpl<$Res>
    extends _$UserWalletConnectedEventCopyWithImpl<$Res,
        _$_UserWalletConnectedEvent>
    implements _$$_UserWalletConnectedEventCopyWith<$Res> {
  __$$_UserWalletConnectedEventCopyWithImpl(_$_UserWalletConnectedEvent _value,
      $Res Function(_$_UserWalletConnectedEvent) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? status = null,
    Object? timestamp = freezed,
    Object? user_id = null,
    Object? wallet_type = null,
  }) {
    return _then(_$_UserWalletConnectedEvent(
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      wallet_type: null == wallet_type
          ? _value.wallet_type
          : wallet_type // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_UserWalletConnectedEvent implements _UserWalletConnectedEvent {
  const _$_UserWalletConnectedEvent(
      {required this.status,
      @TimestampConverter() this.timestamp,
      required this.user_id,
      required this.wallet_type});

  factory _$_UserWalletConnectedEvent.fromJson(Map<String, dynamic> json) =>
      _$$_UserWalletConnectedEventFromJson(json);

  @override
  final String status;
  @override
  @TimestampConverter()
  final DateTime? timestamp;
  @override
  final String user_id;
  @override
  final String wallet_type;

  @override
  String toString() {
    return 'UserWalletConnectedEvent(status: $status, timestamp: $timestamp, user_id: $user_id, wallet_type: $wallet_type)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_UserWalletConnectedEvent &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp) &&
            (identical(other.user_id, user_id) || other.user_id == user_id) &&
            (identical(other.wallet_type, wallet_type) ||
                other.wallet_type == wallet_type));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode =>
      Object.hash(runtimeType, status, timestamp, user_id, wallet_type);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_UserWalletConnectedEventCopyWith<_$_UserWalletConnectedEvent>
      get copyWith => __$$_UserWalletConnectedEventCopyWithImpl<
          _$_UserWalletConnectedEvent>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_UserWalletConnectedEventToJson(
      this,
    );
  }
}

abstract class _UserWalletConnectedEvent implements UserWalletConnectedEvent {
  const factory _UserWalletConnectedEvent(
      {required final String status,
      @TimestampConverter() final DateTime? timestamp,
      required final String user_id,
      required final String wallet_type}) = _$_UserWalletConnectedEvent;

  factory _UserWalletConnectedEvent.fromJson(Map<String, dynamic> json) =
      _$_UserWalletConnectedEvent.fromJson;

  @override
  String get status;
  @override
  @TimestampConverter()
  DateTime? get timestamp;
  @override
  String get user_id;
  @override
  String get wallet_type;
  @override
  @JsonKey(ignore: true)
  _$$_UserWalletConnectedEventCopyWith<_$_UserWalletConnectedEvent>
      get copyWith => throw _privateConstructorUsedError;
}

UserForgotPasswordEvent _$UserForgotPasswordEventFromJson(
    Map<String, dynamic> json) {
  return _UserForgotPasswordEvent.fromJson(json);
}

/// @nodoc
mixin _$UserForgotPasswordEvent {
  String get email => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserForgotPasswordEventCopyWith<UserForgotPasswordEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserForgotPasswordEventCopyWith<$Res> {
  factory $UserForgotPasswordEventCopyWith(UserForgotPasswordEvent value,
          $Res Function(UserForgotPasswordEvent) then) =
      _$UserForgotPasswordEventCopyWithImpl<$Res, UserForgotPasswordEvent>;
  @useResult
  $Res call({String email});
}

/// @nodoc
class _$UserForgotPasswordEventCopyWithImpl<$Res,
        $Val extends UserForgotPasswordEvent>
    implements $UserForgotPasswordEventCopyWith<$Res> {
  _$UserForgotPasswordEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? email = null,
  }) {
    return _then(_value.copyWith(
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_UserForgotPasswordEventCopyWith<$Res>
    implements $UserForgotPasswordEventCopyWith<$Res> {
  factory _$$_UserForgotPasswordEventCopyWith(_$_UserForgotPasswordEvent value,
          $Res Function(_$_UserForgotPasswordEvent) then) =
      __$$_UserForgotPasswordEventCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String email});
}

/// @nodoc
class __$$_UserForgotPasswordEventCopyWithImpl<$Res>
    extends _$UserForgotPasswordEventCopyWithImpl<$Res,
        _$_UserForgotPasswordEvent>
    implements _$$_UserForgotPasswordEventCopyWith<$Res> {
  __$$_UserForgotPasswordEventCopyWithImpl(_$_UserForgotPasswordEvent _value,
      $Res Function(_$_UserForgotPasswordEvent) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? email = null,
  }) {
    return _then(_$_UserForgotPasswordEvent(
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_UserForgotPasswordEvent implements _UserForgotPasswordEvent {
  const _$_UserForgotPasswordEvent({required this.email});

  factory _$_UserForgotPasswordEvent.fromJson(Map<String, dynamic> json) =>
      _$$_UserForgotPasswordEventFromJson(json);

  @override
  final String email;

  @override
  String toString() {
    return 'UserForgotPasswordEvent(email: $email)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_UserForgotPasswordEvent &&
            (identical(other.email, email) || other.email == email));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, email);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_UserForgotPasswordEventCopyWith<_$_UserForgotPasswordEvent>
      get copyWith =>
          __$$_UserForgotPasswordEventCopyWithImpl<_$_UserForgotPasswordEvent>(
              this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_UserForgotPasswordEventToJson(
      this,
    );
  }
}

abstract class _UserForgotPasswordEvent implements UserForgotPasswordEvent {
  const factory _UserForgotPasswordEvent({required final String email}) =
      _$_UserForgotPasswordEvent;

  factory _UserForgotPasswordEvent.fromJson(Map<String, dynamic> json) =
      _$_UserForgotPasswordEvent.fromJson;

  @override
  String get email;
  @override
  @JsonKey(ignore: true)
  _$$_UserForgotPasswordEventCopyWith<_$_UserForgotPasswordEvent>
      get copyWith => throw _privateConstructorUsedError;
}

UserAuthenticationEvent _$UserAuthenticationEventFromJson(
    Map<String, dynamic> json) {
  return _UserAuthenticationEvent.fromJson(json);
}

/// @nodoc
mixin _$UserAuthenticationEvent {
  String get email => throw _privateConstructorUsedError;
  bool get verified => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get timestamp => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserAuthenticationEventCopyWith<UserAuthenticationEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserAuthenticationEventCopyWith<$Res> {
  factory $UserAuthenticationEventCopyWith(UserAuthenticationEvent value,
          $Res Function(UserAuthenticationEvent) then) =
      _$UserAuthenticationEventCopyWithImpl<$Res, UserAuthenticationEvent>;
  @useResult
  $Res call(
      {String email, bool verified, @TimestampConverter() DateTime? timestamp});
}

/// @nodoc
class _$UserAuthenticationEventCopyWithImpl<$Res,
        $Val extends UserAuthenticationEvent>
    implements $UserAuthenticationEventCopyWith<$Res> {
  _$UserAuthenticationEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? email = null,
    Object? verified = null,
    Object? timestamp = freezed,
  }) {
    return _then(_value.copyWith(
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      verified: null == verified
          ? _value.verified
          : verified // ignore: cast_nullable_to_non_nullable
              as bool,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_UserAuthenticationEventCopyWith<$Res>
    implements $UserAuthenticationEventCopyWith<$Res> {
  factory _$$_UserAuthenticationEventCopyWith(_$_UserAuthenticationEvent value,
          $Res Function(_$_UserAuthenticationEvent) then) =
      __$$_UserAuthenticationEventCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String email, bool verified, @TimestampConverter() DateTime? timestamp});
}

/// @nodoc
class __$$_UserAuthenticationEventCopyWithImpl<$Res>
    extends _$UserAuthenticationEventCopyWithImpl<$Res,
        _$_UserAuthenticationEvent>
    implements _$$_UserAuthenticationEventCopyWith<$Res> {
  __$$_UserAuthenticationEventCopyWithImpl(_$_UserAuthenticationEvent _value,
      $Res Function(_$_UserAuthenticationEvent) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? email = null,
    Object? verified = null,
    Object? timestamp = freezed,
  }) {
    return _then(_$_UserAuthenticationEvent(
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      verified: null == verified
          ? _value.verified
          : verified // ignore: cast_nullable_to_non_nullable
              as bool,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_UserAuthenticationEvent implements _UserAuthenticationEvent {
  const _$_UserAuthenticationEvent(
      {required this.email,
      required this.verified,
      @TimestampConverter() this.timestamp});

  factory _$_UserAuthenticationEvent.fromJson(Map<String, dynamic> json) =>
      _$$_UserAuthenticationEventFromJson(json);

  @override
  final String email;
  @override
  final bool verified;
  @override
  @TimestampConverter()
  final DateTime? timestamp;

  @override
  String toString() {
    return 'UserAuthenticationEvent(email: $email, verified: $verified, timestamp: $timestamp)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_UserAuthenticationEvent &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.verified, verified) ||
                other.verified == verified) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, email, verified, timestamp);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_UserAuthenticationEventCopyWith<_$_UserAuthenticationEvent>
      get copyWith =>
          __$$_UserAuthenticationEventCopyWithImpl<_$_UserAuthenticationEvent>(
              this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_UserAuthenticationEventToJson(
      this,
    );
  }
}

abstract class _UserAuthenticationEvent implements UserAuthenticationEvent {
  const factory _UserAuthenticationEvent(
          {required final String email,
          required final bool verified,
          @TimestampConverter() final DateTime? timestamp}) =
      _$_UserAuthenticationEvent;

  factory _UserAuthenticationEvent.fromJson(Map<String, dynamic> json) =
      _$_UserAuthenticationEvent.fromJson;

  @override
  String get email;
  @override
  bool get verified;
  @override
  @TimestampConverter()
  DateTime? get timestamp;
  @override
  @JsonKey(ignore: true)
  _$$_UserAuthenticationEventCopyWith<_$_UserAuthenticationEvent>
      get copyWith => throw _privateConstructorUsedError;
}

UserProfileUpdateEvent _$UserProfileUpdateEventFromJson(
    Map<String, dynamic> json) {
  return _UserProfileUpdateEvent.fromJson(json);
}

/// @nodoc
mixin _$UserProfileUpdateEvent {
  String get user_id => throw _privateConstructorUsedError;
  Map<String, String> get fields => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserProfileUpdateEventCopyWith<UserProfileUpdateEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserProfileUpdateEventCopyWith<$Res> {
  factory $UserProfileUpdateEventCopyWith(UserProfileUpdateEvent value,
          $Res Function(UserProfileUpdateEvent) then) =
      _$UserProfileUpdateEventCopyWithImpl<$Res, UserProfileUpdateEvent>;
  @useResult
  $Res call({String user_id, Map<String, String> fields});
}

/// @nodoc
class _$UserProfileUpdateEventCopyWithImpl<$Res,
        $Val extends UserProfileUpdateEvent>
    implements $UserProfileUpdateEventCopyWith<$Res> {
  _$UserProfileUpdateEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? user_id = null,
    Object? fields = null,
  }) {
    return _then(_value.copyWith(
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      fields: null == fields
          ? _value.fields
          : fields // ignore: cast_nullable_to_non_nullable
              as Map<String, String>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_UserProfileUpdateEventCopyWith<$Res>
    implements $UserProfileUpdateEventCopyWith<$Res> {
  factory _$$_UserProfileUpdateEventCopyWith(_$_UserProfileUpdateEvent value,
          $Res Function(_$_UserProfileUpdateEvent) then) =
      __$$_UserProfileUpdateEventCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String user_id, Map<String, String> fields});
}

/// @nodoc
class __$$_UserProfileUpdateEventCopyWithImpl<$Res>
    extends _$UserProfileUpdateEventCopyWithImpl<$Res,
        _$_UserProfileUpdateEvent>
    implements _$$_UserProfileUpdateEventCopyWith<$Res> {
  __$$_UserProfileUpdateEventCopyWithImpl(_$_UserProfileUpdateEvent _value,
      $Res Function(_$_UserProfileUpdateEvent) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? user_id = null,
    Object? fields = null,
  }) {
    return _then(_$_UserProfileUpdateEvent(
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      fields: null == fields
          ? _value._fields
          : fields // ignore: cast_nullable_to_non_nullable
              as Map<String, String>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_UserProfileUpdateEvent implements _UserProfileUpdateEvent {
  const _$_UserProfileUpdateEvent(
      {required this.user_id, required final Map<String, String> fields})
      : _fields = fields;

  factory _$_UserProfileUpdateEvent.fromJson(Map<String, dynamic> json) =>
      _$$_UserProfileUpdateEventFromJson(json);

  @override
  final String user_id;
  final Map<String, String> _fields;
  @override
  Map<String, String> get fields {
    if (_fields is EqualUnmodifiableMapView) return _fields;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_fields);
  }

  @override
  String toString() {
    return 'UserProfileUpdateEvent(user_id: $user_id, fields: $fields)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_UserProfileUpdateEvent &&
            (identical(other.user_id, user_id) || other.user_id == user_id) &&
            const DeepCollectionEquality().equals(other._fields, _fields));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType, user_id, const DeepCollectionEquality().hash(_fields));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_UserProfileUpdateEventCopyWith<_$_UserProfileUpdateEvent> get copyWith =>
      __$$_UserProfileUpdateEventCopyWithImpl<_$_UserProfileUpdateEvent>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_UserProfileUpdateEventToJson(
      this,
    );
  }
}

abstract class _UserProfileUpdateEvent implements UserProfileUpdateEvent {
  const factory _UserProfileUpdateEvent(
      {required final String user_id,
      required final Map<String, String> fields}) = _$_UserProfileUpdateEvent;

  factory _UserProfileUpdateEvent.fromJson(Map<String, dynamic> json) =
      _$_UserProfileUpdateEvent.fromJson;

  @override
  String get user_id;
  @override
  Map<String, String> get fields;
  @override
  @JsonKey(ignore: true)
  _$$_UserProfileUpdateEventCopyWith<_$_UserProfileUpdateEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

UserAccountDeletionEvent _$UserAccountDeletionEventFromJson(
    Map<String, dynamic> json) {
  return _UserAccountDeletionEvent.fromJson(json);
}

/// @nodoc
mixin _$UserAccountDeletionEvent {
  String get user_id => throw _privateConstructorUsedError;
  String? get reason => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserAccountDeletionEventCopyWith<UserAccountDeletionEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserAccountDeletionEventCopyWith<$Res> {
  factory $UserAccountDeletionEventCopyWith(UserAccountDeletionEvent value,
          $Res Function(UserAccountDeletionEvent) then) =
      _$UserAccountDeletionEventCopyWithImpl<$Res, UserAccountDeletionEvent>;
  @useResult
  $Res call({String user_id, String? reason});
}

/// @nodoc
class _$UserAccountDeletionEventCopyWithImpl<$Res,
        $Val extends UserAccountDeletionEvent>
    implements $UserAccountDeletionEventCopyWith<$Res> {
  _$UserAccountDeletionEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? user_id = null,
    Object? reason = freezed,
  }) {
    return _then(_value.copyWith(
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      reason: freezed == reason
          ? _value.reason
          : reason // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_UserAccountDeletionEventCopyWith<$Res>
    implements $UserAccountDeletionEventCopyWith<$Res> {
  factory _$$_UserAccountDeletionEventCopyWith(
          _$_UserAccountDeletionEvent value,
          $Res Function(_$_UserAccountDeletionEvent) then) =
      __$$_UserAccountDeletionEventCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String user_id, String? reason});
}

/// @nodoc
class __$$_UserAccountDeletionEventCopyWithImpl<$Res>
    extends _$UserAccountDeletionEventCopyWithImpl<$Res,
        _$_UserAccountDeletionEvent>
    implements _$$_UserAccountDeletionEventCopyWith<$Res> {
  __$$_UserAccountDeletionEventCopyWithImpl(_$_UserAccountDeletionEvent _value,
      $Res Function(_$_UserAccountDeletionEvent) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? user_id = null,
    Object? reason = freezed,
  }) {
    return _then(_$_UserAccountDeletionEvent(
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      reason: freezed == reason
          ? _value.reason
          : reason // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_UserAccountDeletionEvent implements _UserAccountDeletionEvent {
  const _$_UserAccountDeletionEvent({required this.user_id, this.reason});

  factory _$_UserAccountDeletionEvent.fromJson(Map<String, dynamic> json) =>
      _$$_UserAccountDeletionEventFromJson(json);

  @override
  final String user_id;
  @override
  final String? reason;

  @override
  String toString() {
    return 'UserAccountDeletionEvent(user_id: $user_id, reason: $reason)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_UserAccountDeletionEvent &&
            (identical(other.user_id, user_id) || other.user_id == user_id) &&
            (identical(other.reason, reason) || other.reason == reason));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, user_id, reason);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_UserAccountDeletionEventCopyWith<_$_UserAccountDeletionEvent>
      get copyWith => __$$_UserAccountDeletionEventCopyWithImpl<
          _$_UserAccountDeletionEvent>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_UserAccountDeletionEventToJson(
      this,
    );
  }
}

abstract class _UserAccountDeletionEvent implements UserAccountDeletionEvent {
  const factory _UserAccountDeletionEvent(
      {required final String user_id,
      final String? reason}) = _$_UserAccountDeletionEvent;

  factory _UserAccountDeletionEvent.fromJson(Map<String, dynamic> json) =
      _$_UserAccountDeletionEvent.fromJson;

  @override
  String get user_id;
  @override
  String? get reason;
  @override
  @JsonKey(ignore: true)
  _$$_UserAccountDeletionEventCopyWith<_$_UserAccountDeletionEvent>
      get copyWith => throw _privateConstructorUsedError;
}

UserInteractionEvent _$UserInteractionEventFromJson(Map<String, dynamic> json) {
  return _UserInteractionEvent.fromJson(json);
}

/// @nodoc
mixin _$UserInteractionEvent {
  String get user_id => throw _privateConstructorUsedError;
  String get interaction => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserInteractionEventCopyWith<UserInteractionEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserInteractionEventCopyWith<$Res> {
  factory $UserInteractionEventCopyWith(UserInteractionEvent value,
          $Res Function(UserInteractionEvent) then) =
      _$UserInteractionEventCopyWithImpl<$Res, UserInteractionEvent>;
  @useResult
  $Res call({String user_id, String interaction});
}

/// @nodoc
class _$UserInteractionEventCopyWithImpl<$Res,
        $Val extends UserInteractionEvent>
    implements $UserInteractionEventCopyWith<$Res> {
  _$UserInteractionEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? user_id = null,
    Object? interaction = null,
  }) {
    return _then(_value.copyWith(
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      interaction: null == interaction
          ? _value.interaction
          : interaction // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_UserInteractionEventCopyWith<$Res>
    implements $UserInteractionEventCopyWith<$Res> {
  factory _$$_UserInteractionEventCopyWith(_$_UserInteractionEvent value,
          $Res Function(_$_UserInteractionEvent) then) =
      __$$_UserInteractionEventCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String user_id, String interaction});
}

/// @nodoc
class __$$_UserInteractionEventCopyWithImpl<$Res>
    extends _$UserInteractionEventCopyWithImpl<$Res, _$_UserInteractionEvent>
    implements _$$_UserInteractionEventCopyWith<$Res> {
  __$$_UserInteractionEventCopyWithImpl(_$_UserInteractionEvent _value,
      $Res Function(_$_UserInteractionEvent) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? user_id = null,
    Object? interaction = null,
  }) {
    return _then(_$_UserInteractionEvent(
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      interaction: null == interaction
          ? _value.interaction
          : interaction // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_UserInteractionEvent implements _UserInteractionEvent {
  const _$_UserInteractionEvent(
      {required this.user_id, required this.interaction});

  factory _$_UserInteractionEvent.fromJson(Map<String, dynamic> json) =>
      _$$_UserInteractionEventFromJson(json);

  @override
  final String user_id;
  @override
  final String interaction;

  @override
  String toString() {
    return 'UserInteractionEvent(user_id: $user_id, interaction: $interaction)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_UserInteractionEvent &&
            (identical(other.user_id, user_id) || other.user_id == user_id) &&
            (identical(other.interaction, interaction) ||
                other.interaction == interaction));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, user_id, interaction);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_UserInteractionEventCopyWith<_$_UserInteractionEvent> get copyWith =>
      __$$_UserInteractionEventCopyWithImpl<_$_UserInteractionEvent>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_UserInteractionEventToJson(
      this,
    );
  }
}

abstract class _UserInteractionEvent implements UserInteractionEvent {
  const factory _UserInteractionEvent(
      {required final String user_id,
      required final String interaction}) = _$_UserInteractionEvent;

  factory _UserInteractionEvent.fromJson(Map<String, dynamic> json) =
      _$_UserInteractionEvent.fromJson;

  @override
  String get user_id;
  @override
  String get interaction;
  @override
  @JsonKey(ignore: true)
  _$$_UserInteractionEventCopyWith<_$_UserInteractionEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

UserEvent _$UserEventFromJson(Map<String, dynamic> json) {
  return _UserEvent.fromJson(json);
}

/// @nodoc
mixin _$UserEvent {
  String? get event_id => throw _privateConstructorUsedError;
  String get event_type => throw _privateConstructorUsedError;
  String get user_id => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get timestamp => throw _privateConstructorUsedError;
  Map<String, Object?>? get additional_data =>
      throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserEventCopyWith<UserEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserEventCopyWith<$Res> {
  factory $UserEventCopyWith(UserEvent value, $Res Function(UserEvent) then) =
      _$UserEventCopyWithImpl<$Res, UserEvent>;
  @useResult
  $Res call(
      {String? event_id,
      String event_type,
      String user_id,
      @TimestampConverter() DateTime? timestamp,
      Map<String, Object?>? additional_data});
}

/// @nodoc
class _$UserEventCopyWithImpl<$Res, $Val extends UserEvent>
    implements $UserEventCopyWith<$Res> {
  _$UserEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? event_id = freezed,
    Object? event_type = null,
    Object? user_id = null,
    Object? timestamp = freezed,
    Object? additional_data = freezed,
  }) {
    return _then(_value.copyWith(
      event_id: freezed == event_id
          ? _value.event_id
          : event_id // ignore: cast_nullable_to_non_nullable
              as String?,
      event_type: null == event_type
          ? _value.event_type
          : event_type // ignore: cast_nullable_to_non_nullable
              as String,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      additional_data: freezed == additional_data
          ? _value.additional_data
          : additional_data // ignore: cast_nullable_to_non_nullable
              as Map<String, Object?>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_UserEventCopyWith<$Res> implements $UserEventCopyWith<$Res> {
  factory _$$_UserEventCopyWith(
          _$_UserEvent value, $Res Function(_$_UserEvent) then) =
      __$$_UserEventCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String? event_id,
      String event_type,
      String user_id,
      @TimestampConverter() DateTime? timestamp,
      Map<String, Object?>? additional_data});
}

/// @nodoc
class __$$_UserEventCopyWithImpl<$Res>
    extends _$UserEventCopyWithImpl<$Res, _$_UserEvent>
    implements _$$_UserEventCopyWith<$Res> {
  __$$_UserEventCopyWithImpl(
      _$_UserEvent _value, $Res Function(_$_UserEvent) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? event_id = freezed,
    Object? event_type = null,
    Object? user_id = null,
    Object? timestamp = freezed,
    Object? additional_data = freezed,
  }) {
    return _then(_$_UserEvent(
      event_id: freezed == event_id
          ? _value.event_id
          : event_id // ignore: cast_nullable_to_non_nullable
              as String?,
      event_type: null == event_type
          ? _value.event_type
          : event_type // ignore: cast_nullable_to_non_nullable
              as String,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      additional_data: freezed == additional_data
          ? _value._additional_data
          : additional_data // ignore: cast_nullable_to_non_nullable
              as Map<String, Object?>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_UserEvent implements _UserEvent {
  const _$_UserEvent(
      {this.event_id,
      required this.event_type,
      required this.user_id,
      @TimestampConverter() this.timestamp,
      final Map<String, Object?>? additional_data})
      : _additional_data = additional_data;

  factory _$_UserEvent.fromJson(Map<String, dynamic> json) =>
      _$$_UserEventFromJson(json);

  @override
  final String? event_id;
  @override
  final String event_type;
  @override
  final String user_id;
  @override
  @TimestampConverter()
  final DateTime? timestamp;
  final Map<String, Object?>? _additional_data;
  @override
  Map<String, Object?>? get additional_data {
    final value = _additional_data;
    if (value == null) return null;
    if (_additional_data is EqualUnmodifiableMapView) return _additional_data;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'UserEvent(event_id: $event_id, event_type: $event_type, user_id: $user_id, timestamp: $timestamp, additional_data: $additional_data)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_UserEvent &&
            (identical(other.event_id, event_id) ||
                other.event_id == event_id) &&
            (identical(other.event_type, event_type) ||
                other.event_type == event_type) &&
            (identical(other.user_id, user_id) || other.user_id == user_id) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp) &&
            const DeepCollectionEquality()
                .equals(other._additional_data, _additional_data));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, event_id, event_type, user_id,
      timestamp, const DeepCollectionEquality().hash(_additional_data));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_UserEventCopyWith<_$_UserEvent> get copyWith =>
      __$$_UserEventCopyWithImpl<_$_UserEvent>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_UserEventToJson(
      this,
    );
  }
}

abstract class _UserEvent implements UserEvent {
  const factory _UserEvent(
      {final String? event_id,
      required final String event_type,
      required final String user_id,
      @TimestampConverter() final DateTime? timestamp,
      final Map<String, Object?>? additional_data}) = _$_UserEvent;

  factory _UserEvent.fromJson(Map<String, dynamic> json) =
      _$_UserEvent.fromJson;

  @override
  String? get event_id;
  @override
  String get event_type;
  @override
  String get user_id;
  @override
  @TimestampConverter()
  DateTime? get timestamp;
  @override
  Map<String, Object?>? get additional_data;
  @override
  @JsonKey(ignore: true)
  _$$_UserEventCopyWith<_$_UserEvent> get copyWith =>
      throw _privateConstructorUsedError;
}
