// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'task_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#custom-getters-and-methods');

TaskModel _$TaskModelFromJson(Map<String, dynamic> json) {
  return _TaskModel.fromJson(json);
}

/// @nodoc
mixin _$TaskModel {
  String get taskDescription => throw _privateConstructorUsedError;
  double get rewardAmount => throw _privateConstructorUsedError;
  String get rewardCurrency => throw _privateConstructorUsedError;
  String? get assignedUser => throw _privateConstructorUsedError;
  bool? get markedCompleted => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  String get taskId => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get expirationDate => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $TaskModelCopyWith<TaskModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskModelCopyWith<$Res> {
  factory $TaskModelCopyWith(TaskModel value, $Res Function(TaskModel) then) =
      _$TaskModelCopyWithImpl<$Res, TaskModel>;
  @useResult
  $Res call(
      {String taskDescription,
      double rewardAmount,
      String rewardCurrency,
      String? assignedUser,
      bool? markedCompleted,
      String userId,
      String taskId,
      @TimestampConverter() DateTime? expirationDate});
}

/// @nodoc
class _$TaskModelCopyWithImpl<$Res, $Val extends TaskModel>
    implements $TaskModelCopyWith<$Res> {
  _$TaskModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? taskDescription = null,
    Object? rewardAmount = null,
    Object? rewardCurrency = null,
    Object? assignedUser = freezed,
    Object? markedCompleted = freezed,
    Object? userId = null,
    Object? taskId = null,
    Object? expirationDate = freezed,
  }) {
    return _then(_value.copyWith(
      taskDescription: null == taskDescription
          ? _value.taskDescription
          : taskDescription // ignore: cast_nullable_to_non_nullable
              as String,
      rewardAmount: null == rewardAmount
          ? _value.rewardAmount
          : rewardAmount // ignore: cast_nullable_to_non_nullable
              as double,
      rewardCurrency: null == rewardCurrency
          ? _value.rewardCurrency
          : rewardCurrency // ignore: cast_nullable_to_non_nullable
              as String,
      assignedUser: freezed == assignedUser
          ? _value.assignedUser
          : assignedUser // ignore: cast_nullable_to_non_nullable
              as String?,
      markedCompleted: freezed == markedCompleted
          ? _value.markedCompleted
          : markedCompleted // ignore: cast_nullable_to_non_nullable
              as bool?,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      taskId: null == taskId
          ? _value.taskId
          : taskId // ignore: cast_nullable_to_non_nullable
              as String,
      expirationDate: freezed == expirationDate
          ? _value.expirationDate
          : expirationDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_TaskModelCopyWith<$Res> implements $TaskModelCopyWith<$Res> {
  factory _$$_TaskModelCopyWith(
          _$_TaskModel value, $Res Function(_$_TaskModel) then) =
      __$$_TaskModelCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String taskDescription,
      double rewardAmount,
      String rewardCurrency,
      String? assignedUser,
      bool? markedCompleted,
      String userId,
      String taskId,
      @TimestampConverter() DateTime? expirationDate});
}

/// @nodoc
class __$$_TaskModelCopyWithImpl<$Res>
    extends _$TaskModelCopyWithImpl<$Res, _$_TaskModel>
    implements _$$_TaskModelCopyWith<$Res> {
  __$$_TaskModelCopyWithImpl(
      _$_TaskModel _value, $Res Function(_$_TaskModel) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? taskDescription = null,
    Object? rewardAmount = null,
    Object? rewardCurrency = null,
    Object? assignedUser = freezed,
    Object? markedCompleted = freezed,
    Object? userId = null,
    Object? taskId = null,
    Object? expirationDate = freezed,
  }) {
    return _then(_$_TaskModel(
      taskDescription: null == taskDescription
          ? _value.taskDescription
          : taskDescription // ignore: cast_nullable_to_non_nullable
              as String,
      rewardAmount: null == rewardAmount
          ? _value.rewardAmount
          : rewardAmount // ignore: cast_nullable_to_non_nullable
              as double,
      rewardCurrency: null == rewardCurrency
          ? _value.rewardCurrency
          : rewardCurrency // ignore: cast_nullable_to_non_nullable
              as String,
      assignedUser: freezed == assignedUser
          ? _value.assignedUser
          : assignedUser // ignore: cast_nullable_to_non_nullable
              as String?,
      markedCompleted: freezed == markedCompleted
          ? _value.markedCompleted
          : markedCompleted // ignore: cast_nullable_to_non_nullable
              as bool?,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      taskId: null == taskId
          ? _value.taskId
          : taskId // ignore: cast_nullable_to_non_nullable
              as String,
      expirationDate: freezed == expirationDate
          ? _value.expirationDate
          : expirationDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskModel implements _TaskModel {
  const _$_TaskModel(
      {required this.taskDescription,
      required this.rewardAmount,
      required this.rewardCurrency,
      this.assignedUser,
      this.markedCompleted,
      required this.userId,
      required this.taskId,
      @TimestampConverter() this.expirationDate});

  factory _$_TaskModel.fromJson(Map<String, dynamic> json) =>
      _$$_TaskModelFromJson(json);

  @override
  final String taskDescription;
  @override
  final double rewardAmount;
  @override
  final String rewardCurrency;
  @override
  final String? assignedUser;
  @override
  final bool? markedCompleted;
  @override
  final String userId;
  @override
  final String taskId;
  @override
  @TimestampConverter()
  final DateTime? expirationDate;

  @override
  String toString() {
    return 'TaskModel(taskDescription: $taskDescription, rewardAmount: $rewardAmount, rewardCurrency: $rewardCurrency, assignedUser: $assignedUser, markedCompleted: $markedCompleted, userId: $userId, taskId: $taskId, expirationDate: $expirationDate)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskModel &&
            (identical(other.taskDescription, taskDescription) ||
                other.taskDescription == taskDescription) &&
            (identical(other.rewardAmount, rewardAmount) ||
                other.rewardAmount == rewardAmount) &&
            (identical(other.rewardCurrency, rewardCurrency) ||
                other.rewardCurrency == rewardCurrency) &&
            (identical(other.assignedUser, assignedUser) ||
                other.assignedUser == assignedUser) &&
            (identical(other.markedCompleted, markedCompleted) ||
                other.markedCompleted == markedCompleted) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.taskId, taskId) || other.taskId == taskId) &&
            (identical(other.expirationDate, expirationDate) ||
                other.expirationDate == expirationDate));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      taskDescription,
      rewardAmount,
      rewardCurrency,
      assignedUser,
      markedCompleted,
      userId,
      taskId,
      expirationDate);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_TaskModelCopyWith<_$_TaskModel> get copyWith =>
      __$$_TaskModelCopyWithImpl<_$_TaskModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_TaskModelToJson(
      this,
    );
  }
}

abstract class _TaskModel implements TaskModel {
  const factory _TaskModel(
      {required final String taskDescription,
      required final double rewardAmount,
      required final String rewardCurrency,
      final String? assignedUser,
      final bool? markedCompleted,
      required final String userId,
      required final String taskId,
      @TimestampConverter() final DateTime? expirationDate}) = _$_TaskModel;

  factory _TaskModel.fromJson(Map<String, dynamic> json) =
      _$_TaskModel.fromJson;

  @override
  String get taskDescription;
  @override
  double get rewardAmount;
  @override
  String get rewardCurrency;
  @override
  String? get assignedUser;
  @override
  bool? get markedCompleted;
  @override
  String get userId;
  @override
  String get taskId;
  @override
  @TimestampConverter()
  DateTime? get expirationDate;
  @override
  @JsonKey(ignore: true)
  _$$_TaskModelCopyWith<_$_TaskModel> get copyWith =>
      throw _privateConstructorUsedError;
}
