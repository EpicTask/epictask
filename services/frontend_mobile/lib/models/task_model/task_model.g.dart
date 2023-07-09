// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'task_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$_TaskModel _$$_TaskModelFromJson(Map<String, dynamic> json) => _$_TaskModel(
      taskDescription: json['taskDescription'] as String,
      rewardAmount: (json['rewardAmount'] as num).toDouble(),
      rewardCurrency: json['rewardCurrency'] as String,
      assignedUser: json['assignedUser'] as String?,
      markedCompleted: json['markedCompleted'] as bool?,
      userId: json['userId'] as String,
      taskId: json['taskId'] as String,
      expirationDate: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['expirationDate'], const TimestampConverter().fromJson),
    );

Map<String, dynamic> _$$_TaskModelToJson(_$_TaskModel instance) =>
    <String, dynamic>{
      'taskDescription': instance.taskDescription,
      'rewardAmount': instance.rewardAmount,
      'rewardCurrency': instance.rewardCurrency,
      'assignedUser': instance.assignedUser,
      'markedCompleted': instance.markedCompleted,
      'userId': instance.userId,
      'taskId': instance.taskId,
      'expirationDate': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.expirationDate, const TimestampConverter().toJson),
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
