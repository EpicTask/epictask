// ignore_for_file: non_constant_identifier_names

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

// required: associates our `user_model.dart` with the code generated by Freezed
part 'user_event.freezed.dart';
// optional: Since our UserModel class is serializable, we must add this line.
// But if UserModel was not serializable, we could skip it.
part 'user_event.g.dart';

class TimestampConverter implements JsonConverter<DateTime, Timestamp> {
  const TimestampConverter();

  @override
  DateTime fromJson(Timestamp json) => json.toDate();

  @override
  Timestamp toJson(DateTime object) => Timestamp.fromDate(object);
}

class TimestampNullableConverter implements JsonConverter<DateTime?, Timestamp?> {
  const TimestampNullableConverter();

  @override
  DateTime? fromJson(Timestamp? json) => json?.toDate();

  @override
  Timestamp? toJson(DateTime? object) =>
      object == null ? null : Timestamp.fromDate(object);
}

@freezed
class UserRegistrationEvent with _$UserRegistrationEvent {
  const factory UserRegistrationEvent({
    required String email,
    required String status,
    required bool social,
    String? socialType,
    @TimestampConverter() DateTime?  timestamp,
  }) = _UserRegistrationEvent;

  factory UserRegistrationEvent.fromJson(Map<String, Object?> json) =>
      _$UserRegistrationEventFromJson(json);
}

@freezed
class UserSignInEvent with _$UserSignInEvent {
  const factory UserSignInEvent({
    required String status,
    required bool social,
    String? social_type,
    @TimestampConverter() DateTime?  timestamp,
  }) = _UserSignInEvent;

  factory UserSignInEvent.fromJson(Map<String, Object?> json) =>
      _$UserSignInEventFromJson(json);
}

@freezed
class UserWalletConnectedEvent with _$UserWalletConnectedEvent {
  const factory UserWalletConnectedEvent({
    required String status,
    @TimestampConverter() DateTime?  timestamp,
    required String user_id,
    required String wallet_type,
  }) = _UserWalletConnectedEvent;

  factory UserWalletConnectedEvent.fromJson(Map<String, Object?> json) =>
      _$UserWalletConnectedEventFromJson(json);
}

@freezed
class UserForgotPasswordEvent with _$UserForgotPasswordEvent {
  const factory UserForgotPasswordEvent({
    required String email,
  }) = _UserForgotPasswordEvent;

  factory UserForgotPasswordEvent.fromJson(Map<String, Object?> json) =>
      _$UserForgotPasswordEventFromJson(json);
}

@freezed
class UserAuthenticationEvent with _$UserAuthenticationEvent {
  const factory UserAuthenticationEvent({
    required String email,
    required bool verified,
    @TimestampConverter() DateTime?  timestamp,
  }) = _UserAuthenticationEvent;

  factory UserAuthenticationEvent.fromJson(Map<String, Object?> json) =>
      _$UserAuthenticationEventFromJson(json);
}

@freezed
class UserProfileUpdateEvent with _$UserProfileUpdateEvent {
  const factory UserProfileUpdateEvent({
    required String user_id,
    required Map<String, String> fields,
  }) = _UserProfileUpdateEvent;

  factory UserProfileUpdateEvent.fromJson(Map<String, Object?> json) =>
      _$UserProfileUpdateEventFromJson(json);
}

@freezed
class UserAccountDeletionEvent with _$UserAccountDeletionEvent {
  const factory UserAccountDeletionEvent({
    required String user_id,
    String? reason,
  }) = _UserAccountDeletionEvent;

  factory UserAccountDeletionEvent.fromJson(Map<String, Object?> json) =>
      _$UserAccountDeletionEventFromJson(json);
}

@freezed
class UserInteractionEvent with _$UserInteractionEvent {
  const factory UserInteractionEvent({
    required String user_id,
    required String interaction,
  }) = _UserInteractionEvent;

  factory UserInteractionEvent.fromJson(Map<String, Object?> json) =>
      _$UserInteractionEventFromJson(json);
}

@freezed
class UserEvent with _$UserEvent {
  const factory UserEvent({
    String? event_id,
    required String event_type,
    required String user_id,
    @TimestampConverter() DateTime?  timestamp,
    Map<String, Object?>? additional_data,
  }) = _UserEvent;

  factory UserEvent.fromJson(Map<String, Object?> json) =>
      _$UserEventFromJson(json);
}
