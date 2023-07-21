// GENERATED CODE - DO NOT MODIFY BY HAND

// ignore_for_file: non_constant_identifier_names

part of 'leaderboard_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$_LeaderboardModel _$$_LeaderboardModelFromJson(Map<String, dynamic> json) =>
    _$_LeaderboardModel(
      eTask_earned: (json['eTask_earned'] as num?)?.toDouble(),
      lastUpdated: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['lastUpdated'], const TimestampConverter().fromJson),
      tasks_completed: json['tasks_completed'] as int,
      user_id: json['user_id'] as String,
      xrp_earned: (json['xrp_earned'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$$_LeaderboardModelToJson(_$_LeaderboardModel instance) =>
    <String, dynamic>{
      'eTask_earned': instance.eTask_earned,
      'lastUpdated': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.lastUpdated, const TimestampConverter().toJson),
      'tasks_completed': instance.tasks_completed,
      'user_id': instance.user_id,
      'xrp_earned': instance.xrp_earned,
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
