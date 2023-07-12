import 'package:freezed_annotation/freezed_annotation.dart';

// required: associates our `user_model.dart` with the code generated by Freezed
part 'task_event.freezed.dart';
// optional: Since our UserModel class is serializable, we must add this line.
// But if UserModel was not serializable, we could skip it.
part 'task_event.g.dart';

@freezed
class TaskEvent with _$TaskEvent {
  const factory TaskEvent({
    required String eventId,
    required String eventType,
    required String timestamp,
    required String taskId,
    required String userId,
    required String status,
    Map<String, dynamic>? additionalData,
  }) = _TaskEvent;

    factory TaskEvent.fromJson(Map<String, Object?> json) =>
      _$TaskEventFromJson(json);
}


@freezed
class TaskAssigned with _$TaskAssigned {
  const factory TaskAssigned({
    required String taskId,
    required String assignedToId,
  }) = _TaskAssigned;

    factory TaskAssigned.fromJson(Map<String, Object?> json) =>
      _$TaskAssignedFromJson(json);
}

@freezed
class TaskCancelled with _$TaskCancelled {
  const factory TaskCancelled({
    required String taskId,
  }) = _TaskCancelled;

    factory TaskCancelled.fromJson(Map<String, Object?> json) =>
      _$TaskCancelledFromJson(json);
}

@freezed
class TaskCommentAdded with _$TaskCommentAdded {
  const factory TaskCommentAdded({
    required String taskId,
    required String userId,
    required String comment,
  }) = _TaskCommentAdded;

    factory TaskCommentAdded.fromJson(Map<String, Object?> json) =>
      _$TaskCommentAddedFromJson(json);
}

@freezed
class TaskCompleted with _$TaskCompleted {
  const factory TaskCompleted({
    required String taskId,
    required String completedById,
    List<String>? attachments,
    bool? markedCompleted,
    bool? verified,
  }) = _TaskCompleted;

    factory TaskCompleted.fromJson(Map<String, Object?> json) =>
      _$TaskCompletedFromJson(json);
}

@freezed
class TaskExpired with _$TaskExpired {
  const factory TaskExpired({
    required String taskId,
  }) = _TaskExpired;

    factory TaskExpired.fromJson(Map<String, Object?> json) =>
      _$TaskExpiredFromJson(json);
}

@freezed
class TaskRatingUpdate with _$TaskRatingUpdate {
  const factory TaskRatingUpdate({
    required String taskId,
    required String userId,
  }) = _TaskRatingUpdate;

    factory TaskRatingUpdate.fromJson(Map<String, Object?> json) =>
      _$TaskRatingUpdateFromJson(json);
}

@freezed
class TaskRewarded with _$TaskRewarded {
  const factory TaskRewarded({
    required String taskId,
    required String userId,
  }) = _TaskRewarded;

    factory TaskRewarded.fromJson(Map<String, Object?> json) =>
      _$TaskRewardedFromJson(json);
}

@freezed
class TaskUpdated with _$TaskUpdated {
  const factory TaskUpdated({
    required String taskId,
    required Map<String, dynamic> updatedFields,
  }) = _TaskUpdated;

    factory TaskUpdated.fromJson(Map<String, Object?> json) =>
      _$TaskUpdatedFromJson(json);
}
