// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'task_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#custom-getters-and-methods');

TaskEvent _$TaskEventFromJson(Map<String, dynamic> json) {
  return _TaskEvent.fromJson(json);
}

/// @nodoc
mixin _$TaskEvent {
  String? get event_id => throw _privateConstructorUsedError;
  String get event_type => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get timestamp => throw _privateConstructorUsedError;
  String? get task_id => throw _privateConstructorUsedError;
  String get user_id => throw _privateConstructorUsedError;
  String? get status => throw _privateConstructorUsedError;
  Map<String, dynamic>? get additional_data =>
      throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $TaskEventCopyWith<TaskEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskEventCopyWith<$Res> {
  factory $TaskEventCopyWith(TaskEvent value, $Res Function(TaskEvent) then) =
      _$TaskEventCopyWithImpl<$Res, TaskEvent>;
  @useResult
  $Res call(
      {String? event_id,
      String event_type,
      @TimestampConverter() DateTime? timestamp,
      String? task_id,
      String user_id,
      String? status,
      Map<String, dynamic>? additional_data});
}

/// @nodoc
class _$TaskEventCopyWithImpl<$Res, $Val extends TaskEvent>
    implements $TaskEventCopyWith<$Res> {
  _$TaskEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? event_id = freezed,
    Object? event_type = null,
    Object? timestamp = freezed,
    Object? task_id = freezed,
    Object? user_id = null,
    Object? status = freezed,
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
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      task_id: freezed == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String?,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      status: freezed == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String?,
      additional_data: freezed == additional_data
          ? _value.additional_data
          : additional_data // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_TaskEventCopyWith<$Res> implements $TaskEventCopyWith<$Res> {
  factory _$$_TaskEventCopyWith(
          _$_TaskEvent value, $Res Function(_$_TaskEvent) then) =
      __$$_TaskEventCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String? event_id,
      String event_type,
      @TimestampConverter() DateTime? timestamp,
      String? task_id,
      String user_id,
      String? status,
      Map<String, dynamic>? additional_data});
}

/// @nodoc
class __$$_TaskEventCopyWithImpl<$Res>
    extends _$TaskEventCopyWithImpl<$Res, _$_TaskEvent>
    implements _$$_TaskEventCopyWith<$Res> {
  __$$_TaskEventCopyWithImpl(
      _$_TaskEvent _value, $Res Function(_$_TaskEvent) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? event_id = freezed,
    Object? event_type = null,
    Object? timestamp = freezed,
    Object? task_id = freezed,
    Object? user_id = null,
    Object? status = freezed,
    Object? additional_data = freezed,
  }) {
    return _then(_$_TaskEvent(
      event_id: freezed == event_id
          ? _value.event_id
          : event_id // ignore: cast_nullable_to_non_nullable
              as String?,
      event_type: null == event_type
          ? _value.event_type
          : event_type // ignore: cast_nullable_to_non_nullable
              as String,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      task_id: freezed == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String?,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      status: freezed == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String?,
      additional_data: freezed == additional_data
          ? _value._additional_data
          : additional_data // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskEvent implements _TaskEvent {
  const _$_TaskEvent(
      {this.event_id,
      required this.event_type,
      @TimestampConverter() this.timestamp,
      this.task_id,
      required this.user_id,
      this.status,
      final Map<String, dynamic>? additional_data})
      : _additional_data = additional_data;

  factory _$_TaskEvent.fromJson(Map<String, dynamic> json) =>
      _$$_TaskEventFromJson(json);

  @override
  final String? event_id;
  @override
  final String event_type;
  @override
  @TimestampConverter()
  final DateTime? timestamp;
  @override
  final String? task_id;
  @override
  final String user_id;
  @override
  final String? status;
  final Map<String, dynamic>? _additional_data;
  @override
  Map<String, dynamic>? get additional_data {
    final value = _additional_data;
    if (value == null) return null;
    if (_additional_data is EqualUnmodifiableMapView) return _additional_data;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'TaskEvent(event_id: $event_id, event_type: $event_type, timestamp: $timestamp, task_id: $task_id, user_id: $user_id, status: $status, additional_data: $additional_data)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskEvent &&
            (identical(other.event_id, event_id) ||
                other.event_id == event_id) &&
            (identical(other.event_type, event_type) ||
                other.event_type == event_type) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp) &&
            (identical(other.task_id, task_id) || other.task_id == task_id) &&
            (identical(other.user_id, user_id) || other.user_id == user_id) &&
            (identical(other.status, status) || other.status == status) &&
            const DeepCollectionEquality()
                .equals(other._additional_data, _additional_data));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      event_id,
      event_type,
      timestamp,
      task_id,
      user_id,
      status,
      const DeepCollectionEquality().hash(_additional_data));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_TaskEventCopyWith<_$_TaskEvent> get copyWith =>
      __$$_TaskEventCopyWithImpl<_$_TaskEvent>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_TaskEventToJson(
      this,
    );
  }
}

abstract class _TaskEvent implements TaskEvent {
  const factory _TaskEvent(
      {final String? event_id,
      required final String event_type,
      @TimestampConverter() final DateTime? timestamp,
      final String? task_id,
      required final String user_id,
      final String? status,
      final Map<String, dynamic>? additional_data}) = _$_TaskEvent;

  factory _TaskEvent.fromJson(Map<String, dynamic> json) =
      _$_TaskEvent.fromJson;

  @override
  String? get event_id;
  @override
  String get event_type;
  @override
  @TimestampConverter()
  DateTime? get timestamp;
  @override
  String? get task_id;
  @override
  String get user_id;
  @override
  String? get status;
  @override
  Map<String, dynamic>? get additional_data;
  @override
  @JsonKey(ignore: true)
  _$$_TaskEventCopyWith<_$_TaskEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

TaskAssigned _$TaskAssignedFromJson(Map<String, dynamic> json) {
  return _TaskAssigned.fromJson(json);
}

/// @nodoc
mixin _$TaskAssigned {
  String get task_id => throw _privateConstructorUsedError;
  String get assigned_to_ids => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $TaskAssignedCopyWith<TaskAssigned> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskAssignedCopyWith<$Res> {
  factory $TaskAssignedCopyWith(
          TaskAssigned value, $Res Function(TaskAssigned) then) =
      _$TaskAssignedCopyWithImpl<$Res, TaskAssigned>;
  @useResult
  $Res call({String task_id, String assigned_to_ids});
}

/// @nodoc
class _$TaskAssignedCopyWithImpl<$Res, $Val extends TaskAssigned>
    implements $TaskAssignedCopyWith<$Res> {
  _$TaskAssignedCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? assigned_to_ids = null,
  }) {
    return _then(_value.copyWith(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      assigned_to_ids: null == assigned_to_ids
          ? _value.assigned_to_ids
          : assigned_to_ids // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_TaskAssignedCopyWith<$Res>
    implements $TaskAssignedCopyWith<$Res> {
  factory _$$_TaskAssignedCopyWith(
          _$_TaskAssigned value, $Res Function(_$_TaskAssigned) then) =
      __$$_TaskAssignedCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String task_id, String assigned_to_ids});
}

/// @nodoc
class __$$_TaskAssignedCopyWithImpl<$Res>
    extends _$TaskAssignedCopyWithImpl<$Res, _$_TaskAssigned>
    implements _$$_TaskAssignedCopyWith<$Res> {
  __$$_TaskAssignedCopyWithImpl(
      _$_TaskAssigned _value, $Res Function(_$_TaskAssigned) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? assigned_to_ids = null,
  }) {
    return _then(_$_TaskAssigned(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      assigned_to_ids: null == assigned_to_ids
          ? _value.assigned_to_ids
          : assigned_to_ids // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskAssigned implements _TaskAssigned {
  const _$_TaskAssigned({required this.task_id, required this.assigned_to_ids});

  factory _$_TaskAssigned.fromJson(Map<String, dynamic> json) =>
      _$$_TaskAssignedFromJson(json);

  @override
  final String task_id;
  @override
  final String assigned_to_ids;

  @override
  String toString() {
    return 'TaskAssigned(task_id: $task_id, assigned_to_ids: $assigned_to_ids)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskAssigned &&
            (identical(other.task_id, task_id) || other.task_id == task_id) &&
            (identical(other.assigned_to_ids, assigned_to_ids) ||
                other.assigned_to_ids == assigned_to_ids));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, task_id, assigned_to_ids);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_TaskAssignedCopyWith<_$_TaskAssigned> get copyWith =>
      __$$_TaskAssignedCopyWithImpl<_$_TaskAssigned>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_TaskAssignedToJson(
      this,
    );
  }
}

abstract class _TaskAssigned implements TaskAssigned {
  const factory _TaskAssigned(
      {required final String task_id,
      required final String assigned_to_ids}) = _$_TaskAssigned;

  factory _TaskAssigned.fromJson(Map<String, dynamic> json) =
      _$_TaskAssigned.fromJson;

  @override
  String get task_id;
  @override
  String get assigned_to_ids;
  @override
  @JsonKey(ignore: true)
  _$$_TaskAssignedCopyWith<_$_TaskAssigned> get copyWith =>
      throw _privateConstructorUsedError;
}

TaskCancelled _$TaskCancelledFromJson(Map<String, dynamic> json) {
  return _TaskCancelled.fromJson(json);
}

/// @nodoc
mixin _$TaskCancelled {
  String get task_id => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $TaskCancelledCopyWith<TaskCancelled> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskCancelledCopyWith<$Res> {
  factory $TaskCancelledCopyWith(
          TaskCancelled value, $Res Function(TaskCancelled) then) =
      _$TaskCancelledCopyWithImpl<$Res, TaskCancelled>;
  @useResult
  $Res call({String task_id});
}

/// @nodoc
class _$TaskCancelledCopyWithImpl<$Res, $Val extends TaskCancelled>
    implements $TaskCancelledCopyWith<$Res> {
  _$TaskCancelledCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
  }) {
    return _then(_value.copyWith(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_TaskCancelledCopyWith<$Res>
    implements $TaskCancelledCopyWith<$Res> {
  factory _$$_TaskCancelledCopyWith(
          _$_TaskCancelled value, $Res Function(_$_TaskCancelled) then) =
      __$$_TaskCancelledCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String task_id});
}

/// @nodoc
class __$$_TaskCancelledCopyWithImpl<$Res>
    extends _$TaskCancelledCopyWithImpl<$Res, _$_TaskCancelled>
    implements _$$_TaskCancelledCopyWith<$Res> {
  __$$_TaskCancelledCopyWithImpl(
      _$_TaskCancelled _value, $Res Function(_$_TaskCancelled) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
  }) {
    return _then(_$_TaskCancelled(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskCancelled implements _TaskCancelled {
  const _$_TaskCancelled({required this.task_id});

  factory _$_TaskCancelled.fromJson(Map<String, dynamic> json) =>
      _$$_TaskCancelledFromJson(json);

  @override
  final String task_id;

  @override
  String toString() {
    return 'TaskCancelled(task_id: $task_id)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskCancelled &&
            (identical(other.task_id, task_id) || other.task_id == task_id));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, task_id);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_TaskCancelledCopyWith<_$_TaskCancelled> get copyWith =>
      __$$_TaskCancelledCopyWithImpl<_$_TaskCancelled>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_TaskCancelledToJson(
      this,
    );
  }
}

abstract class _TaskCancelled implements TaskCancelled {
  const factory _TaskCancelled({required final String task_id}) =
      _$_TaskCancelled;

  factory _TaskCancelled.fromJson(Map<String, dynamic> json) =
      _$_TaskCancelled.fromJson;

  @override
  String get task_id;
  @override
  @JsonKey(ignore: true)
  _$$_TaskCancelledCopyWith<_$_TaskCancelled> get copyWith =>
      throw _privateConstructorUsedError;
}

TaskCommentAdded _$TaskCommentAddedFromJson(Map<String, dynamic> json) {
  return _TaskCommentAdded.fromJson(json);
}

/// @nodoc
mixin _$TaskCommentAdded {
  String get task_id => throw _privateConstructorUsedError;
  String get user_id => throw _privateConstructorUsedError;
  String get comment => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $TaskCommentAddedCopyWith<TaskCommentAdded> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskCommentAddedCopyWith<$Res> {
  factory $TaskCommentAddedCopyWith(
          TaskCommentAdded value, $Res Function(TaskCommentAdded) then) =
      _$TaskCommentAddedCopyWithImpl<$Res, TaskCommentAdded>;
  @useResult
  $Res call({String task_id, String user_id, String comment});
}

/// @nodoc
class _$TaskCommentAddedCopyWithImpl<$Res, $Val extends TaskCommentAdded>
    implements $TaskCommentAddedCopyWith<$Res> {
  _$TaskCommentAddedCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? user_id = null,
    Object? comment = null,
  }) {
    return _then(_value.copyWith(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      comment: null == comment
          ? _value.comment
          : comment // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_TaskCommentAddedCopyWith<$Res>
    implements $TaskCommentAddedCopyWith<$Res> {
  factory _$$_TaskCommentAddedCopyWith(
          _$_TaskCommentAdded value, $Res Function(_$_TaskCommentAdded) then) =
      __$$_TaskCommentAddedCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String task_id, String user_id, String comment});
}

/// @nodoc
class __$$_TaskCommentAddedCopyWithImpl<$Res>
    extends _$TaskCommentAddedCopyWithImpl<$Res, _$_TaskCommentAdded>
    implements _$$_TaskCommentAddedCopyWith<$Res> {
  __$$_TaskCommentAddedCopyWithImpl(
      _$_TaskCommentAdded _value, $Res Function(_$_TaskCommentAdded) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? user_id = null,
    Object? comment = null,
  }) {
    return _then(_$_TaskCommentAdded(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      comment: null == comment
          ? _value.comment
          : comment // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskCommentAdded implements _TaskCommentAdded {
  const _$_TaskCommentAdded(
      {required this.task_id, required this.user_id, required this.comment});

  factory _$_TaskCommentAdded.fromJson(Map<String, dynamic> json) =>
      _$$_TaskCommentAddedFromJson(json);

  @override
  final String task_id;
  @override
  final String user_id;
  @override
  final String comment;

  @override
  String toString() {
    return 'TaskCommentAdded(task_id: $task_id, user_id: $user_id, comment: $comment)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskCommentAdded &&
            (identical(other.task_id, task_id) || other.task_id == task_id) &&
            (identical(other.user_id, user_id) || other.user_id == user_id) &&
            (identical(other.comment, comment) || other.comment == comment));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, task_id, user_id, comment);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_TaskCommentAddedCopyWith<_$_TaskCommentAdded> get copyWith =>
      __$$_TaskCommentAddedCopyWithImpl<_$_TaskCommentAdded>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_TaskCommentAddedToJson(
      this,
    );
  }
}

abstract class _TaskCommentAdded implements TaskCommentAdded {
  const factory _TaskCommentAdded(
      {required final String task_id,
      required final String user_id,
      required final String comment}) = _$_TaskCommentAdded;

  factory _TaskCommentAdded.fromJson(Map<String, dynamic> json) =
      _$_TaskCommentAdded.fromJson;

  @override
  String get task_id;
  @override
  String get user_id;
  @override
  String get comment;
  @override
  @JsonKey(ignore: true)
  _$$_TaskCommentAddedCopyWith<_$_TaskCommentAdded> get copyWith =>
      throw _privateConstructorUsedError;
}

TaskCompleted _$TaskCompletedFromJson(Map<String, dynamic> json) {
  return _TaskCompleted.fromJson(json);
}

/// @nodoc
mixin _$TaskCompleted {
  String get task_id => throw _privateConstructorUsedError;
  String get completed_by_id => throw _privateConstructorUsedError;
  List<String>? get attachments => throw _privateConstructorUsedError;
  bool? get marked_completed => throw _privateConstructorUsedError;
  bool? get verified => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $TaskCompletedCopyWith<TaskCompleted> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskCompletedCopyWith<$Res> {
  factory $TaskCompletedCopyWith(
          TaskCompleted value, $Res Function(TaskCompleted) then) =
      _$TaskCompletedCopyWithImpl<$Res, TaskCompleted>;
  @useResult
  $Res call(
      {String task_id,
      String completed_by_id,
      List<String>? attachments,
      bool? marked_completed,
      bool? verified});
}

/// @nodoc
class _$TaskCompletedCopyWithImpl<$Res, $Val extends TaskCompleted>
    implements $TaskCompletedCopyWith<$Res> {
  _$TaskCompletedCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? completed_by_id = null,
    Object? attachments = freezed,
    Object? marked_completed = freezed,
    Object? verified = freezed,
  }) {
    return _then(_value.copyWith(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      completed_by_id: null == completed_by_id
          ? _value.completed_by_id
          : completed_by_id // ignore: cast_nullable_to_non_nullable
              as String,
      attachments: freezed == attachments
          ? _value.attachments
          : attachments // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      marked_completed: freezed == marked_completed
          ? _value.marked_completed
          : marked_completed // ignore: cast_nullable_to_non_nullable
              as bool?,
      verified: freezed == verified
          ? _value.verified
          : verified // ignore: cast_nullable_to_non_nullable
              as bool?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_TaskCompletedCopyWith<$Res>
    implements $TaskCompletedCopyWith<$Res> {
  factory _$$_TaskCompletedCopyWith(
          _$_TaskCompleted value, $Res Function(_$_TaskCompleted) then) =
      __$$_TaskCompletedCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String task_id,
      String completed_by_id,
      List<String>? attachments,
      bool? marked_completed,
      bool? verified});
}

/// @nodoc
class __$$_TaskCompletedCopyWithImpl<$Res>
    extends _$TaskCompletedCopyWithImpl<$Res, _$_TaskCompleted>
    implements _$$_TaskCompletedCopyWith<$Res> {
  __$$_TaskCompletedCopyWithImpl(
      _$_TaskCompleted _value, $Res Function(_$_TaskCompleted) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? completed_by_id = null,
    Object? attachments = freezed,
    Object? marked_completed = freezed,
    Object? verified = freezed,
  }) {
    return _then(_$_TaskCompleted(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      completed_by_id: null == completed_by_id
          ? _value.completed_by_id
          : completed_by_id // ignore: cast_nullable_to_non_nullable
              as String,
      attachments: freezed == attachments
          ? _value._attachments
          : attachments // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      marked_completed: freezed == marked_completed
          ? _value.marked_completed
          : marked_completed // ignore: cast_nullable_to_non_nullable
              as bool?,
      verified: freezed == verified
          ? _value.verified
          : verified // ignore: cast_nullable_to_non_nullable
              as bool?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskCompleted implements _TaskCompleted {
  const _$_TaskCompleted(
      {required this.task_id,
      required this.completed_by_id,
      final List<String>? attachments,
      this.marked_completed,
      this.verified})
      : _attachments = attachments;

  factory _$_TaskCompleted.fromJson(Map<String, dynamic> json) =>
      _$$_TaskCompletedFromJson(json);

  @override
  final String task_id;
  @override
  final String completed_by_id;
  final List<String>? _attachments;
  @override
  List<String>? get attachments {
    final value = _attachments;
    if (value == null) return null;
    if (_attachments is EqualUnmodifiableListView) return _attachments;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final bool? marked_completed;
  @override
  final bool? verified;

  @override
  String toString() {
    return 'TaskCompleted(task_id: $task_id, completed_by_id: $completed_by_id, attachments: $attachments, marked_completed: $marked_completed, verified: $verified)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskCompleted &&
            (identical(other.task_id, task_id) || other.task_id == task_id) &&
            (identical(other.completed_by_id, completed_by_id) ||
                other.completed_by_id == completed_by_id) &&
            const DeepCollectionEquality()
                .equals(other._attachments, _attachments) &&
            (identical(other.marked_completed, marked_completed) ||
                other.marked_completed == marked_completed) &&
            (identical(other.verified, verified) ||
                other.verified == verified));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      task_id,
      completed_by_id,
      const DeepCollectionEquality().hash(_attachments),
      marked_completed,
      verified);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_TaskCompletedCopyWith<_$_TaskCompleted> get copyWith =>
      __$$_TaskCompletedCopyWithImpl<_$_TaskCompleted>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_TaskCompletedToJson(
      this,
    );
  }
}

abstract class _TaskCompleted implements TaskCompleted {
  const factory _TaskCompleted(
      {required final String task_id,
      required final String completed_by_id,
      final List<String>? attachments,
      final bool? marked_completed,
      final bool? verified}) = _$_TaskCompleted;

  factory _TaskCompleted.fromJson(Map<String, dynamic> json) =
      _$_TaskCompleted.fromJson;

  @override
  String get task_id;
  @override
  String get completed_by_id;
  @override
  List<String>? get attachments;
  @override
  bool? get marked_completed;
  @override
  bool? get verified;
  @override
  @JsonKey(ignore: true)
  _$$_TaskCompletedCopyWith<_$_TaskCompleted> get copyWith =>
      throw _privateConstructorUsedError;
}

TaskExpired _$TaskExpiredFromJson(Map<String, dynamic> json) {
  return _TaskExpired.fromJson(json);
}

/// @nodoc
mixin _$TaskExpired {
  String get task_id => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $TaskExpiredCopyWith<TaskExpired> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskExpiredCopyWith<$Res> {
  factory $TaskExpiredCopyWith(
          TaskExpired value, $Res Function(TaskExpired) then) =
      _$TaskExpiredCopyWithImpl<$Res, TaskExpired>;
  @useResult
  $Res call({String task_id});
}

/// @nodoc
class _$TaskExpiredCopyWithImpl<$Res, $Val extends TaskExpired>
    implements $TaskExpiredCopyWith<$Res> {
  _$TaskExpiredCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
  }) {
    return _then(_value.copyWith(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_TaskExpiredCopyWith<$Res>
    implements $TaskExpiredCopyWith<$Res> {
  factory _$$_TaskExpiredCopyWith(
          _$_TaskExpired value, $Res Function(_$_TaskExpired) then) =
      __$$_TaskExpiredCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String task_id});
}

/// @nodoc
class __$$_TaskExpiredCopyWithImpl<$Res>
    extends _$TaskExpiredCopyWithImpl<$Res, _$_TaskExpired>
    implements _$$_TaskExpiredCopyWith<$Res> {
  __$$_TaskExpiredCopyWithImpl(
      _$_TaskExpired _value, $Res Function(_$_TaskExpired) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
  }) {
    return _then(_$_TaskExpired(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskExpired implements _TaskExpired {
  const _$_TaskExpired({required this.task_id});

  factory _$_TaskExpired.fromJson(Map<String, dynamic> json) =>
      _$$_TaskExpiredFromJson(json);

  @override
  final String task_id;

  @override
  String toString() {
    return 'TaskExpired(task_id: $task_id)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskExpired &&
            (identical(other.task_id, task_id) || other.task_id == task_id));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, task_id);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_TaskExpiredCopyWith<_$_TaskExpired> get copyWith =>
      __$$_TaskExpiredCopyWithImpl<_$_TaskExpired>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_TaskExpiredToJson(
      this,
    );
  }
}

abstract class _TaskExpired implements TaskExpired {
  const factory _TaskExpired({required final String task_id}) = _$_TaskExpired;

  factory _TaskExpired.fromJson(Map<String, dynamic> json) =
      _$_TaskExpired.fromJson;

  @override
  String get task_id;
  @override
  @JsonKey(ignore: true)
  _$$_TaskExpiredCopyWith<_$_TaskExpired> get copyWith =>
      throw _privateConstructorUsedError;
}

TaskRatingUpdate _$TaskRatingUpdateFromJson(Map<String, dynamic> json) {
  return _TaskRatingUpdate.fromJson(json);
}

/// @nodoc
mixin _$TaskRatingUpdate {
  String get task_id => throw _privateConstructorUsedError;
  String get user_id => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $TaskRatingUpdateCopyWith<TaskRatingUpdate> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskRatingUpdateCopyWith<$Res> {
  factory $TaskRatingUpdateCopyWith(
          TaskRatingUpdate value, $Res Function(TaskRatingUpdate) then) =
      _$TaskRatingUpdateCopyWithImpl<$Res, TaskRatingUpdate>;
  @useResult
  $Res call({String task_id, String user_id});
}

/// @nodoc
class _$TaskRatingUpdateCopyWithImpl<$Res, $Val extends TaskRatingUpdate>
    implements $TaskRatingUpdateCopyWith<$Res> {
  _$TaskRatingUpdateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? user_id = null,
  }) {
    return _then(_value.copyWith(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_TaskRatingUpdateCopyWith<$Res>
    implements $TaskRatingUpdateCopyWith<$Res> {
  factory _$$_TaskRatingUpdateCopyWith(
          _$_TaskRatingUpdate value, $Res Function(_$_TaskRatingUpdate) then) =
      __$$_TaskRatingUpdateCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String task_id, String user_id});
}

/// @nodoc
class __$$_TaskRatingUpdateCopyWithImpl<$Res>
    extends _$TaskRatingUpdateCopyWithImpl<$Res, _$_TaskRatingUpdate>
    implements _$$_TaskRatingUpdateCopyWith<$Res> {
  __$$_TaskRatingUpdateCopyWithImpl(
      _$_TaskRatingUpdate _value, $Res Function(_$_TaskRatingUpdate) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? user_id = null,
  }) {
    return _then(_$_TaskRatingUpdate(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskRatingUpdate implements _TaskRatingUpdate {
  const _$_TaskRatingUpdate({required this.task_id, required this.user_id});

  factory _$_TaskRatingUpdate.fromJson(Map<String, dynamic> json) =>
      _$$_TaskRatingUpdateFromJson(json);

  @override
  final String task_id;
  @override
  final String user_id;

  @override
  String toString() {
    return 'TaskRatingUpdate(task_id: $task_id, user_id: $user_id)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskRatingUpdate &&
            (identical(other.task_id, task_id) || other.task_id == task_id) &&
            (identical(other.user_id, user_id) || other.user_id == user_id));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, task_id, user_id);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_TaskRatingUpdateCopyWith<_$_TaskRatingUpdate> get copyWith =>
      __$$_TaskRatingUpdateCopyWithImpl<_$_TaskRatingUpdate>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_TaskRatingUpdateToJson(
      this,
    );
  }
}

abstract class _TaskRatingUpdate implements TaskRatingUpdate {
  const factory _TaskRatingUpdate(
      {required final String task_id,
      required final String user_id}) = _$_TaskRatingUpdate;

  factory _TaskRatingUpdate.fromJson(Map<String, dynamic> json) =
      _$_TaskRatingUpdate.fromJson;

  @override
  String get task_id;
  @override
  String get user_id;
  @override
  @JsonKey(ignore: true)
  _$$_TaskRatingUpdateCopyWith<_$_TaskRatingUpdate> get copyWith =>
      throw _privateConstructorUsedError;
}

TaskRewarded _$TaskRewardedFromJson(Map<String, dynamic> json) {
  return _TaskRewarded.fromJson(json);
}

/// @nodoc
mixin _$TaskRewarded {
  String get task_id => throw _privateConstructorUsedError;
  String get user_id => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $TaskRewardedCopyWith<TaskRewarded> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskRewardedCopyWith<$Res> {
  factory $TaskRewardedCopyWith(
          TaskRewarded value, $Res Function(TaskRewarded) then) =
      _$TaskRewardedCopyWithImpl<$Res, TaskRewarded>;
  @useResult
  $Res call({String task_id, String user_id});
}

/// @nodoc
class _$TaskRewardedCopyWithImpl<$Res, $Val extends TaskRewarded>
    implements $TaskRewardedCopyWith<$Res> {
  _$TaskRewardedCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? user_id = null,
  }) {
    return _then(_value.copyWith(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_TaskRewardedCopyWith<$Res>
    implements $TaskRewardedCopyWith<$Res> {
  factory _$$_TaskRewardedCopyWith(
          _$_TaskRewarded value, $Res Function(_$_TaskRewarded) then) =
      __$$_TaskRewardedCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String task_id, String user_id});
}

/// @nodoc
class __$$_TaskRewardedCopyWithImpl<$Res>
    extends _$TaskRewardedCopyWithImpl<$Res, _$_TaskRewarded>
    implements _$$_TaskRewardedCopyWith<$Res> {
  __$$_TaskRewardedCopyWithImpl(
      _$_TaskRewarded _value, $Res Function(_$_TaskRewarded) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? user_id = null,
  }) {
    return _then(_$_TaskRewarded(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskRewarded implements _TaskRewarded {
  const _$_TaskRewarded({required this.task_id, required this.user_id});

  factory _$_TaskRewarded.fromJson(Map<String, dynamic> json) =>
      _$$_TaskRewardedFromJson(json);

  @override
  final String task_id;
  @override
  final String user_id;

  @override
  String toString() {
    return 'TaskRewarded(task_id: $task_id, user_id: $user_id)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskRewarded &&
            (identical(other.task_id, task_id) || other.task_id == task_id) &&
            (identical(other.user_id, user_id) || other.user_id == user_id));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, task_id, user_id);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_TaskRewardedCopyWith<_$_TaskRewarded> get copyWith =>
      __$$_TaskRewardedCopyWithImpl<_$_TaskRewarded>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_TaskRewardedToJson(
      this,
    );
  }
}

abstract class _TaskRewarded implements TaskRewarded {
  const factory _TaskRewarded(
      {required final String task_id,
      required final String user_id}) = _$_TaskRewarded;

  factory _TaskRewarded.fromJson(Map<String, dynamic> json) =
      _$_TaskRewarded.fromJson;

  @override
  String get task_id;
  @override
  String get user_id;
  @override
  @JsonKey(ignore: true)
  _$$_TaskRewardedCopyWith<_$_TaskRewarded> get copyWith =>
      throw _privateConstructorUsedError;
}

TaskUpdated _$TaskUpdatedFromJson(Map<String, dynamic> json) {
  return _TaskUpdated.fromJson(json);
}

/// @nodoc
mixin _$TaskUpdated {
  String get task_id => throw _privateConstructorUsedError;
  Map<String, dynamic> get updated_fields => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $TaskUpdatedCopyWith<TaskUpdated> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskUpdatedCopyWith<$Res> {
  factory $TaskUpdatedCopyWith(
          TaskUpdated value, $Res Function(TaskUpdated) then) =
      _$TaskUpdatedCopyWithImpl<$Res, TaskUpdated>;
  @useResult
  $Res call({String task_id, Map<String, dynamic> updated_fields});
}

/// @nodoc
class _$TaskUpdatedCopyWithImpl<$Res, $Val extends TaskUpdated>
    implements $TaskUpdatedCopyWith<$Res> {
  _$TaskUpdatedCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? updated_fields = null,
  }) {
    return _then(_value.copyWith(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      updated_fields: null == updated_fields
          ? _value.updated_fields
          : updated_fields // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_TaskUpdatedCopyWith<$Res>
    implements $TaskUpdatedCopyWith<$Res> {
  factory _$$_TaskUpdatedCopyWith(
          _$_TaskUpdated value, $Res Function(_$_TaskUpdated) then) =
      __$$_TaskUpdatedCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String task_id, Map<String, dynamic> updated_fields});
}

/// @nodoc
class __$$_TaskUpdatedCopyWithImpl<$Res>
    extends _$TaskUpdatedCopyWithImpl<$Res, _$_TaskUpdated>
    implements _$$_TaskUpdatedCopyWith<$Res> {
  __$$_TaskUpdatedCopyWithImpl(
      _$_TaskUpdated _value, $Res Function(_$_TaskUpdated) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? task_id = null,
    Object? updated_fields = null,
  }) {
    return _then(_$_TaskUpdated(
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      updated_fields: null == updated_fields
          ? _value._updated_fields
          : updated_fields // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskUpdated implements _TaskUpdated {
  const _$_TaskUpdated(
      {required this.task_id,
      required final Map<String, dynamic> updated_fields})
      : _updated_fields = updated_fields;

  factory _$_TaskUpdated.fromJson(Map<String, dynamic> json) =>
      _$$_TaskUpdatedFromJson(json);

  @override
  final String task_id;
  final Map<String, dynamic> _updated_fields;
  @override
  Map<String, dynamic> get updated_fields {
    if (_updated_fields is EqualUnmodifiableMapView) return _updated_fields;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_updated_fields);
  }

  @override
  String toString() {
    return 'TaskUpdated(task_id: $task_id, updated_fields: $updated_fields)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskUpdated &&
            (identical(other.task_id, task_id) || other.task_id == task_id) &&
            const DeepCollectionEquality()
                .equals(other._updated_fields, _updated_fields));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, task_id,
      const DeepCollectionEquality().hash(_updated_fields));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_TaskUpdatedCopyWith<_$_TaskUpdated> get copyWith =>
      __$$_TaskUpdatedCopyWithImpl<_$_TaskUpdated>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_TaskUpdatedToJson(
      this,
    );
  }
}

abstract class _TaskUpdated implements TaskUpdated {
  const factory _TaskUpdated(
      {required final String task_id,
      required final Map<String, dynamic> updated_fields}) = _$_TaskUpdated;

  factory _TaskUpdated.fromJson(Map<String, dynamic> json) =
      _$_TaskUpdated.fromJson;

  @override
  String get task_id;
  @override
  Map<String, dynamic> get updated_fields;
  @override
  @JsonKey(ignore: true)
  _$$_TaskUpdatedCopyWith<_$_TaskUpdated> get copyWith =>
      throw _privateConstructorUsedError;
}
