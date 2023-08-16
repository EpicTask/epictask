// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$_UserModel _$$_UserModelFromJson(Map<String, dynamic> json) => _$_UserModel(
      displayName: json['displayName'] as String?,
      email: json['email'] as String?,
      imageUrl: json['imageUrl'] as String?,
      uid: json['uid'] as String,
      dateCreated: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['dateCreated'], const TimestampConverter().fromJson),
    );

Map<String, dynamic> _$$_UserModelToJson(_$_UserModel instance) =>
    <String, dynamic>{
      'displayName': instance.displayName,
      'email': instance.email,
      'imageUrl': instance.imageUrl,
      'uid': instance.uid,
      'dateCreated': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.dateCreated, const TimestampConverter().toJson),
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

_$_CurrentUserModel _$$_CurrentUserModelFromJson(Map<String, dynamic> json) =>
    _$_CurrentUserModel(
      displayName: json['displayName'] as String?,
      email: json['email'] as String?,
      imageUrl: json['imageUrl'] as String?,
      publicAddress: json['publicAddress'] as String?,
      uid: json['uid'] as String,
    );

Map<String, dynamic> _$$_CurrentUserModelToJson(_$_CurrentUserModel instance) =>
    <String, dynamic>{
      'displayName': instance.displayName,
      'email': instance.email,
      'imageUrl': instance.imageUrl,
      'publicAddress': instance.publicAddress,
      'uid': instance.uid,
    };
