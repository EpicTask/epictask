// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'task_event.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$_TaskEvent _$$_TaskEventFromJson(Map<String, dynamic> json) => _$_TaskEvent(
      eventId: json['eventId'] as String,
      eventType: json['eventType'] as String,
      timestamp: json['timestamp'] as String,
      taskId: json['taskId'] as String,
      userId: json['userId'] as String,
      status: json['status'] as String,
      additionalData: json['additionalData'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$_TaskEventToJson(_$_TaskEvent instance) =>
    <String, dynamic>{
      'eventId': instance.eventId,
      'eventType': instance.eventType,
      'timestamp': instance.timestamp,
      'taskId': instance.taskId,
      'userId': instance.userId,
      'status': instance.status,
      'additionalData': instance.additionalData,
    };

_$_TaskAssigned _$$_TaskAssignedFromJson(Map<String, dynamic> json) =>
    _$_TaskAssigned(
      taskId: json['taskId'] as String,
      assignedToId: json['assignedToId'] as String,
    );

Map<String, dynamic> _$$_TaskAssignedToJson(_$_TaskAssigned instance) =>
    <String, dynamic>{
      'taskId': instance.taskId,
      'assignedToId': instance.assignedToId,
    };

_$_TaskCancelled _$$_TaskCancelledFromJson(Map<String, dynamic> json) =>
    _$_TaskCancelled(
      taskId: json['taskId'] as String,
    );

Map<String, dynamic> _$$_TaskCancelledToJson(_$_TaskCancelled instance) =>
    <String, dynamic>{
      'taskId': instance.taskId,
    };

_$_TaskCommentAdded _$$_TaskCommentAddedFromJson(Map<String, dynamic> json) =>
    _$_TaskCommentAdded(
      taskId: json['taskId'] as String,
      userId: json['userId'] as String,
      comment: json['comment'] as String,
    );

Map<String, dynamic> _$$_TaskCommentAddedToJson(_$_TaskCommentAdded instance) =>
    <String, dynamic>{
      'taskId': instance.taskId,
      'userId': instance.userId,
      'comment': instance.comment,
    };

_$_TaskCompleted _$$_TaskCompletedFromJson(Map<String, dynamic> json) =>
    _$_TaskCompleted(
      taskId: json['taskId'] as String,
      completedById: json['completedById'] as String,
      attachments: (json['attachments'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      markedCompleted: json['markedCompleted'] as bool?,
      verified: json['verified'] as bool?,
    );

Map<String, dynamic> _$$_TaskCompletedToJson(_$_TaskCompleted instance) =>
    <String, dynamic>{
      'taskId': instance.taskId,
      'completedById': instance.completedById,
      'attachments': instance.attachments,
      'markedCompleted': instance.markedCompleted,
      'verified': instance.verified,
    };

_$_TaskExpired _$$_TaskExpiredFromJson(Map<String, dynamic> json) =>
    _$_TaskExpired(
      taskId: json['taskId'] as String,
    );

Map<String, dynamic> _$$_TaskExpiredToJson(_$_TaskExpired instance) =>
    <String, dynamic>{
      'taskId': instance.taskId,
    };

_$_TaskRatingUpdate _$$_TaskRatingUpdateFromJson(Map<String, dynamic> json) =>
    _$_TaskRatingUpdate(
      taskId: json['taskId'] as String,
      userId: json['userId'] as String,
    );

Map<String, dynamic> _$$_TaskRatingUpdateToJson(_$_TaskRatingUpdate instance) =>
    <String, dynamic>{
      'taskId': instance.taskId,
      'userId': instance.userId,
    };

_$_TaskRewarded _$$_TaskRewardedFromJson(Map<String, dynamic> json) =>
    _$_TaskRewarded(
      taskId: json['taskId'] as String,
      userId: json['userId'] as String,
    );

Map<String, dynamic> _$$_TaskRewardedToJson(_$_TaskRewarded instance) =>
    <String, dynamic>{
      'taskId': instance.taskId,
      'userId': instance.userId,
    };

_$_TaskUpdated _$$_TaskUpdatedFromJson(Map<String, dynamic> json) =>
    _$_TaskUpdated(
      taskId: json['taskId'] as String,
      updatedFields: json['updatedFields'] as Map<String, dynamic>,
    );

Map<String, dynamic> _$$_TaskUpdatedToJson(_$_TaskUpdated instance) =>
    <String, dynamic>{
      'taskId': instance.taskId,
      'updatedFields': instance.updatedFields,
    };
