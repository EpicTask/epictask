// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_event.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$_UserRegistrationEvent _$$_UserRegistrationEventFromJson(
        Map<String, dynamic> json) =>
    _$_UserRegistrationEvent(
      email: json['email'] as String,
      status: json['status'] as String,
      social: json['social'] as bool,
      socialType: json['socialType'] as String?,
      timestamp: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['timestamp'], const TimestampConverter().fromJson),
    );

Map<String, dynamic> _$$_UserRegistrationEventToJson(
        _$_UserRegistrationEvent instance) =>
    <String, dynamic>{
      'email': instance.email,
      'status': instance.status,
      'social': instance.social,
      'socialType': instance.socialType,
      'timestamp': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.timestamp, const TimestampConverter().toJson),
    };

Value? _$JsonConverterFromJson<Json, Value>(
  Object? json,
  Value? Function(Json json) fromJson,
) =>
    json == null ? null : fromJson(json as Json);

Json? _$JsonConverterToJson<Json, Value>(
  Value? value,
  Json? Function(Value value) toJson,
) =>
    value == null ? null : toJson(value);

_$_UserSignInEvent _$$_UserSignInEventFromJson(Map<String, dynamic> json) =>
    _$_UserSignInEvent(
      status: json['status'] as String,
      social: json['social'] as bool,
      socialType: json['socialType'] as String?,
      timestamp: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['timestamp'], const TimestampConverter().fromJson),
    );

Map<String, dynamic> _$$_UserSignInEventToJson(_$_UserSignInEvent instance) =>
    <String, dynamic>{
      'status': instance.status,
      'social': instance.social,
      'socialType': instance.socialType,
      'timestamp': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.timestamp, const TimestampConverter().toJson),
    };

_$_UserWalletConnectedEvent _$$_UserWalletConnectedEventFromJson(
        Map<String, dynamic> json) =>
    _$_UserWalletConnectedEvent(
      status: json['status'] as String,
      timestamp: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['timestamp'], const TimestampConverter().fromJson),
      walletType: json['walletType'] as bool,
    );

Map<String, dynamic> _$$_UserWalletConnectedEventToJson(
        _$_UserWalletConnectedEvent instance) =>
    <String, dynamic>{
      'status': instance.status,
      'timestamp': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.timestamp, const TimestampConverter().toJson),
      'walletType': instance.walletType,
    };

_$_UserForgotPasswordEvent _$$_UserForgotPasswordEventFromJson(
        Map<String, dynamic> json) =>
    _$_UserForgotPasswordEvent(
      email: json['email'] as String,
    );

Map<String, dynamic> _$$_UserForgotPasswordEventToJson(
        _$_UserForgotPasswordEvent instance) =>
    <String, dynamic>{
      'email': instance.email,
    };

_$_UserAuthenticationEvent _$$_UserAuthenticationEventFromJson(
        Map<String, dynamic> json) =>
    _$_UserAuthenticationEvent(
      email: json['email'] as String,
      verified: json['verified'] as bool,
      timestamp: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['timestamp'], const TimestampConverter().fromJson),
    );

Map<String, dynamic> _$$_UserAuthenticationEventToJson(
        _$_UserAuthenticationEvent instance) =>
    <String, dynamic>{
      'email': instance.email,
      'verified': instance.verified,
      'timestamp': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.timestamp, const TimestampConverter().toJson),
    };

_$_UserProfileUpdateEvent _$$_UserProfileUpdateEventFromJson(
        Map<String, dynamic> json) =>
    _$_UserProfileUpdateEvent(
      userId: json['userId'] as String,
      fields: Map<String, String>.from(json['fields'] as Map),
    );

Map<String, dynamic> _$$_UserProfileUpdateEventToJson(
        _$_UserProfileUpdateEvent instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'fields': instance.fields,
    };

_$_UserAccountDeletionEvent _$$_UserAccountDeletionEventFromJson(
        Map<String, dynamic> json) =>
    _$_UserAccountDeletionEvent(
      userId: json['userId'] as String,
      reason: json['reason'] as String?,
    );

Map<String, dynamic> _$$_UserAccountDeletionEventToJson(
        _$_UserAccountDeletionEvent instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'reason': instance.reason,
    };

_$_UserInteractionEvent _$$_UserInteractionEventFromJson(
        Map<String, dynamic> json) =>
    _$_UserInteractionEvent(
      userId: json['userId'] as String,
      interaction: json['interaction'] as String,
    );

Map<String, dynamic> _$$_UserInteractionEventToJson(
        _$_UserInteractionEvent instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'interaction': instance.interaction,
    };

_$_UserEvent _$$_UserEventFromJson(Map<String, dynamic> json) => _$_UserEvent(
      eventId: json['eventId'] as String,
      eventType: json['eventType'] as String,
      userId: json['userId'] as String,
      timestamp: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['timestamp'], const TimestampConverter().fromJson),
      additionalData: json['additionalData'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$_UserEventToJson(_$_UserEvent instance) =>
    <String, dynamic>{
      'eventId': instance.eventId,
      'eventType': instance.eventType,
      'userId': instance.userId,
      'timestamp': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.timestamp, const TimestampConverter().toJson),
      'additionalData': instance.additionalData,
    };
