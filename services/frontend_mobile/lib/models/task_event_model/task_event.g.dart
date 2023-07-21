// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'task_event.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$_TaskEvent _$$_TaskEventFromJson(Map<String, dynamic> json) => _$_TaskEvent(
      event_id: json['event_id'] as String?,
      event_type: json['event_type'] as String,
      timestamp: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['timestamp'], const TimestampConverter().fromJson),
      task_id: json['task_id'] as String?,
      user_id: json['user_id'] as String,
      status: json['status'] as String?,
      additional_data: json['additional_data'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$_TaskEventToJson(_$_TaskEvent instance) =>
    <String, dynamic>{
      'event_id': instance.event_id,
      'event_type': instance.event_type,
      'timestamp': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.timestamp, const TimestampConverter().toJson),
      'task_id': instance.task_id,
      'user_id': instance.user_id,
      'status': instance.status,
      'additional_data': instance.additional_data,
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

_$_TaskAssigned _$$_TaskAssignedFromJson(Map<String, dynamic> json) =>
    _$_TaskAssigned(
      task_id: json['task_id'] as String,
      assigned_to_id: json['assigned_to_id'] as String,
    );

Map<String, dynamic> _$$_TaskAssignedToJson(_$_TaskAssigned instance) =>
    <String, dynamic>{
      'task_id': instance.task_id,
      'assigned_to_id': instance.assigned_to_id,
    };

_$_TaskCancelled _$$_TaskCancelledFromJson(Map<String, dynamic> json) =>
    _$_TaskCancelled(
      task_id: json['task_id'] as String,
    );

Map<String, dynamic> _$$_TaskCancelledToJson(_$_TaskCancelled instance) =>
    <String, dynamic>{
      'task_id': instance.task_id,
    };

_$_TaskCommentAdded _$$_TaskCommentAddedFromJson(Map<String, dynamic> json) =>
    _$_TaskCommentAdded(
      task_id: json['task_id'] as String,
      user_id: json['user_id'] as String,
      comment: json['comment'] as String,
    );

Map<String, dynamic> _$$_TaskCommentAddedToJson(_$_TaskCommentAdded instance) =>
    <String, dynamic>{
      'task_id': instance.task_id,
      'user_id': instance.user_id,
      'comment': instance.comment,
    };

_$_TaskCompleted _$$_TaskCompletedFromJson(Map<String, dynamic> json) =>
    _$_TaskCompleted(
      task_id: json['task_id'] as String,
      completed_by_id: json['completed_by_id'] as String,
      attachments: (json['attachments'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      marked_completed: json['marked_completed'] as bool?,
      verified: json['verified'] as bool?,
      verification_method: json['verification_method'] as String?,
    );

Map<String, dynamic> _$$_TaskCompletedToJson(_$_TaskCompleted instance) =>
    <String, dynamic>{
      'task_id': instance.task_id,
      'completed_by_id': instance.completed_by_id,
      'attachments': instance.attachments,
      'marked_completed': instance.marked_completed,
      'verified': instance.verified,
      'verification_method': instance.verification_method,
    };

_$_TaskExpired _$$_TaskExpiredFromJson(Map<String, dynamic> json) =>
    _$_TaskExpired(
      task_id: json['task_id'] as String,
    );

Map<String, dynamic> _$$_TaskExpiredToJson(_$_TaskExpired instance) =>
    <String, dynamic>{
      'task_id': instance.task_id,
    };

_$_TaskRatingUpdate _$$_TaskRatingUpdateFromJson(Map<String, dynamic> json) =>
    _$_TaskRatingUpdate(
      task_id: json['task_id'] as String,
      user_id: json['user_id'] as String,
    );

Map<String, dynamic> _$$_TaskRatingUpdateToJson(_$_TaskRatingUpdate instance) =>
    <String, dynamic>{
      'task_id': instance.task_id,
      'user_id': instance.user_id,
    };

_$_TaskRewarded _$$_TaskRewardedFromJson(Map<String, dynamic> json) =>
    _$_TaskRewarded(
      task_id: json['task_id'] as String,
      user_id: json['user_id'] as String,
    );

Map<String, dynamic> _$$_TaskRewardedToJson(_$_TaskRewarded instance) =>
    <String, dynamic>{
      'task_id': instance.task_id,
      'user_id': instance.user_id,
    };

_$_TaskUpdated _$$_TaskUpdatedFromJson(Map<String, dynamic> json) =>
    _$_TaskUpdated(
      task_id: json['task_id'] as String,
      updated_fields: json['updated_fields'] as Map<String, dynamic>,
    );

Map<String, dynamic> _$$_TaskUpdatedToJson(_$_TaskUpdated instance) =>
    <String, dynamic>{
      'task_id': instance.task_id,
      'updated_fields': instance.updated_fields,
    };

_$_TaskVerified _$$_TaskVerifiedFromJson(Map<String, dynamic> json) =>
    _$_TaskVerified(
      task_id: json['task_id'] as String,
      verified: json['verified'] as bool,
      verification_method: json['verification_method'] as String,
    );

Map<String, dynamic> _$$_TaskVerifiedToJson(_$_TaskVerified instance) =>
    <String, dynamic>{
      'task_id': instance.task_id,
      'verified': instance.verified,
      'verification_method': instance.verification_method,
    };
