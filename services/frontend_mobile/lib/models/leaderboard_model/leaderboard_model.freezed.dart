// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'leaderboard_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#custom-getters-and-methods');

LeaderboardModel _$LeaderboardModelFromJson(Map<String, dynamic> json) {
  return _LeaderboardModel.fromJson(json);
}

/// @nodoc
mixin _$LeaderboardModel {
  double? get eTask_earned => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get lastUpdated => throw _privateConstructorUsedError;
  int get tasks_completed => throw _privateConstructorUsedError;
  String get user_id => throw _privateConstructorUsedError;
  double? get xrp_earned => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $LeaderboardModelCopyWith<LeaderboardModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LeaderboardModelCopyWith<$Res> {
  factory $LeaderboardModelCopyWith(
          LeaderboardModel value, $Res Function(LeaderboardModel) then) =
      _$LeaderboardModelCopyWithImpl<$Res, LeaderboardModel>;
  @useResult
  $Res call(
      {double? eTask_earned,
      @TimestampConverter() DateTime? lastUpdated,
      int tasks_completed,
      String user_id,
      double? xrp_earned});
}

/// @nodoc
class _$LeaderboardModelCopyWithImpl<$Res, $Val extends LeaderboardModel>
    implements $LeaderboardModelCopyWith<$Res> {
  _$LeaderboardModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? eTask_earned = freezed,
    Object? lastUpdated = freezed,
    Object? tasks_completed = null,
    Object? user_id = null,
    Object? xrp_earned = freezed,
  }) {
    return _then(_value.copyWith(
      eTask_earned: freezed == eTask_earned
          ? _value.eTask_earned
          : eTask_earned // ignore: cast_nullable_to_non_nullable
              as double?,
      lastUpdated: freezed == lastUpdated
          ? _value.lastUpdated
          : lastUpdated // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      tasks_completed: null == tasks_completed
          ? _value.tasks_completed
          : tasks_completed // ignore: cast_nullable_to_non_nullable
              as int,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      xrp_earned: freezed == xrp_earned
          ? _value.xrp_earned
          : xrp_earned // ignore: cast_nullable_to_non_nullable
              as double?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_LeaderboardModelCopyWith<$Res>
    implements $LeaderboardModelCopyWith<$Res> {
  factory _$$_LeaderboardModelCopyWith(
          _$_LeaderboardModel value, $Res Function(_$_LeaderboardModel) then) =
      __$$_LeaderboardModelCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {double? eTask_earned,
      @TimestampConverter() DateTime? lastUpdated,
      int tasks_completed,
      String user_id,
      double? xrp_earned});
}

/// @nodoc
class __$$_LeaderboardModelCopyWithImpl<$Res>
    extends _$LeaderboardModelCopyWithImpl<$Res, _$_LeaderboardModel>
    implements _$$_LeaderboardModelCopyWith<$Res> {
  __$$_LeaderboardModelCopyWithImpl(
      _$_LeaderboardModel _value, $Res Function(_$_LeaderboardModel) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? eTask_earned = freezed,
    Object? lastUpdated = freezed,
    Object? tasks_completed = null,
    Object? user_id = null,
    Object? xrp_earned = freezed,
  }) {
    return _then(_$_LeaderboardModel(
      eTask_earned: freezed == eTask_earned
          ? _value.eTask_earned
          : eTask_earned // ignore: cast_nullable_to_non_nullable
              as double?,
      lastUpdated: freezed == lastUpdated
          ? _value.lastUpdated
          : lastUpdated // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      tasks_completed: null == tasks_completed
          ? _value.tasks_completed
          : tasks_completed // ignore: cast_nullable_to_non_nullable
              as int,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      xrp_earned: freezed == xrp_earned
          ? _value.xrp_earned
          : xrp_earned // ignore: cast_nullable_to_non_nullable
              as double?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_LeaderboardModel implements _LeaderboardModel {
  const _$_LeaderboardModel(
      {this.eTask_earned,
      @TimestampConverter() this.lastUpdated,
      required this.tasks_completed,
      required this.user_id,
      this.xrp_earned});

  factory _$_LeaderboardModel.fromJson(Map<String, dynamic> json) =>
      _$$_LeaderboardModelFromJson(json);

  @override
  final double? eTask_earned;
  @override
  @TimestampConverter()
  final DateTime? lastUpdated;
  @override
  final int tasks_completed;
  @override
  final String user_id;
  @override
  final double? xrp_earned;

  @override
  String toString() {
    return 'LeaderboardModel(eTask_earned: $eTask_earned, lastUpdated: $lastUpdated, tasks_completed: $tasks_completed, user_id: $user_id, xrp_earned: $xrp_earned)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_LeaderboardModel &&
            (identical(other.eTask_earned, eTask_earned) ||
                other.eTask_earned == eTask_earned) &&
            (identical(other.lastUpdated, lastUpdated) ||
                other.lastUpdated == lastUpdated) &&
            (identical(other.tasks_completed, tasks_completed) ||
                other.tasks_completed == tasks_completed) &&
            (identical(other.user_id, user_id) || other.user_id == user_id) &&
            (identical(other.xrp_earned, xrp_earned) ||
                other.xrp_earned == xrp_earned));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, eTask_earned, lastUpdated,
      tasks_completed, user_id, xrp_earned);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_LeaderboardModelCopyWith<_$_LeaderboardModel> get copyWith =>
      __$$_LeaderboardModelCopyWithImpl<_$_LeaderboardModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_LeaderboardModelToJson(
      this,
    );
  }
}

abstract class _LeaderboardModel implements LeaderboardModel {
  const factory _LeaderboardModel(
      {final double? eTask_earned,
      @TimestampConverter() final DateTime? lastUpdated,
      required final int tasks_completed,
      required final String user_id,
      final double? xrp_earned}) = _$_LeaderboardModel;

  factory _LeaderboardModel.fromJson(Map<String, dynamic> json) =
      _$_LeaderboardModel.fromJson;

  @override
  double? get eTask_earned;
  @override
  @TimestampConverter()
  DateTime? get lastUpdated;
  @override
  int get tasks_completed;
  @override
  String get user_id;
  @override
  double? get xrp_earned;
  @override
  @JsonKey(ignore: true)
  _$$_LeaderboardModelCopyWith<_$_LeaderboardModel> get copyWith =>
      throw _privateConstructorUsedError;
}
