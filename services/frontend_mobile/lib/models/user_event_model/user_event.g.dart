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
      social_type: json['social_type'] as String?,
      timestamp: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['timestamp'], const TimestampConverter().fromJson),
    );

Map<String, dynamic> _$$_UserSignInEventToJson(_$_UserSignInEvent instance) =>
    <String, dynamic>{
      'status': instance.status,
      'social': instance.social,
      'social_type': instance.social_type,
      'timestamp': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.timestamp, const TimestampConverter().toJson),
    };

_$_UserWalletConnectedEvent _$$_UserWalletConnectedEventFromJson(
        Map<String, dynamic> json) =>
    _$_UserWalletConnectedEvent(
      status: json['status'] as String,
      timestamp: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['timestamp'], const TimestampConverter().fromJson),
      user_id: json['user_id'] as String,
      wallet_type: json['wallet_type'] as String,
    );

Map<String, dynamic> _$$_UserWalletConnectedEventToJson(
        _$_UserWalletConnectedEvent instance) =>
    <String, dynamic>{
      'status': instance.status,
      'timestamp': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.timestamp, const TimestampConverter().toJson),
      'user_id': instance.user_id,
      'wallet_type': instance.wallet_type,
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
      user_id: json['user_id'] as String,
      fields: Map<String, String>.from(json['fields'] as Map),
    );

Map<String, dynamic> _$$_UserProfileUpdateEventToJson(
        _$_UserProfileUpdateEvent instance) =>
    <String, dynamic>{
      'user_id': instance.user_id,
      'fields': instance.fields,
    };

_$_UserAccountDeletionEvent _$$_UserAccountDeletionEventFromJson(
        Map<String, dynamic> json) =>
    _$_UserAccountDeletionEvent(
      user_id: json['user_id'] as String,
      reason: json['reason'] as String?,
    );

Map<String, dynamic> _$$_UserAccountDeletionEventToJson(
        _$_UserAccountDeletionEvent instance) =>
    <String, dynamic>{
      'user_id': instance.user_id,
      'reason': instance.reason,
    };

_$_UserInteractionEvent _$$_UserInteractionEventFromJson(
        Map<String, dynamic> json) =>
    _$_UserInteractionEvent(
      user_id: json['user_id'] as String,
      interaction: json['interaction'] as String,
    );

Map<String, dynamic> _$$_UserInteractionEventToJson(
        _$_UserInteractionEvent instance) =>
    <String, dynamic>{
      'user_id': instance.user_id,
      'interaction': instance.interaction,
    };

_$_UserEvent _$$_UserEventFromJson(Map<String, dynamic> json) => _$_UserEvent(
      event_id: json['event_id'] as String?,
      event_type: json['event_type'] as String,
      user_id: json['user_id'] as String,
      timestamp: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['timestamp'], const TimestampConverter().fromJson),
      additional_data: json['additional_data'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$_UserEventToJson(_$_UserEvent instance) =>
    <String, dynamic>{
      'event_id': instance.event_id,
      'event_type': instance.event_type,
      'user_id': instance.user_id,
      'timestamp': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.timestamp, const TimestampConverter().toJson),
      'additional_data': instance.additional_data,
    };
