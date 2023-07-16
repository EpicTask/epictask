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
  List<String?>? get assigned_to_ids => throw _privateConstructorUsedError;
  bool? get auto_verify => throw _privateConstructorUsedError;
  int get expiration_date => throw _privateConstructorUsedError;
  bool? get marked_completed => throw _privateConstructorUsedError;
  String get payment_method => throw _privateConstructorUsedError;
  String? get project_id => throw _privateConstructorUsedError;
  String? get project_name => throw _privateConstructorUsedError;
  int? get rating => throw _privateConstructorUsedError;
  bool? get requires_attachments => throw _privateConstructorUsedError;
  double get reward_amount => throw _privateConstructorUsedError;
  String get reward_currency => throw _privateConstructorUsedError;
  bool get rewarded => throw _privateConstructorUsedError;
  String get task_description => throw _privateConstructorUsedError;
  String get task_id => throw _privateConstructorUsedError;
  String? get task_title => throw _privateConstructorUsedError;
  String? get terms_blob => throw _privateConstructorUsedError;
  String? get terms_id => throw _privateConstructorUsedError;
  String get user_id => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get timestamp => throw _privateConstructorUsedError;

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
      {List<String?>? assigned_to_ids,
      bool? auto_verify,
      int expiration_date,
      bool? marked_completed,
      String payment_method,
      String? project_id,
      String? project_name,
      int? rating,
      bool? requires_attachments,
      double reward_amount,
      String reward_currency,
      bool rewarded,
      String task_description,
      String task_id,
      String? task_title,
      String? terms_blob,
      String? terms_id,
      String user_id,
      @TimestampConverter() DateTime? timestamp});
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
    Object? assigned_to_ids = freezed,
    Object? auto_verify = freezed,
    Object? expiration_date = null,
    Object? marked_completed = freezed,
    Object? payment_method = null,
    Object? project_id = freezed,
    Object? project_name = freezed,
    Object? rating = freezed,
    Object? requires_attachments = freezed,
    Object? reward_amount = null,
    Object? reward_currency = null,
    Object? rewarded = null,
    Object? task_description = null,
    Object? task_id = null,
    Object? task_title = freezed,
    Object? terms_blob = freezed,
    Object? terms_id = freezed,
    Object? user_id = null,
    Object? timestamp = freezed,
  }) {
    return _then(_value.copyWith(
      assigned_to_ids: freezed == assigned_to_ids
          ? _value.assigned_to_ids
          : assigned_to_ids // ignore: cast_nullable_to_non_nullable
              as List<String?>?,
      auto_verify: freezed == auto_verify
          ? _value.auto_verify
          : auto_verify // ignore: cast_nullable_to_non_nullable
              as bool?,
      expiration_date: null == expiration_date
          ? _value.expiration_date
          : expiration_date // ignore: cast_nullable_to_non_nullable
              as int,
      marked_completed: freezed == marked_completed
          ? _value.marked_completed
          : marked_completed // ignore: cast_nullable_to_non_nullable
              as bool?,
      payment_method: null == payment_method
          ? _value.payment_method
          : payment_method // ignore: cast_nullable_to_non_nullable
              as String,
      project_id: freezed == project_id
          ? _value.project_id
          : project_id // ignore: cast_nullable_to_non_nullable
              as String?,
      project_name: freezed == project_name
          ? _value.project_name
          : project_name // ignore: cast_nullable_to_non_nullable
              as String?,
      rating: freezed == rating
          ? _value.rating
          : rating // ignore: cast_nullable_to_non_nullable
              as int?,
      requires_attachments: freezed == requires_attachments
          ? _value.requires_attachments
          : requires_attachments // ignore: cast_nullable_to_non_nullable
              as bool?,
      reward_amount: null == reward_amount
          ? _value.reward_amount
          : reward_amount // ignore: cast_nullable_to_non_nullable
              as double,
      reward_currency: null == reward_currency
          ? _value.reward_currency
          : reward_currency // ignore: cast_nullable_to_non_nullable
              as String,
      rewarded: null == rewarded
          ? _value.rewarded
          : rewarded // ignore: cast_nullable_to_non_nullable
              as bool,
      task_description: null == task_description
          ? _value.task_description
          : task_description // ignore: cast_nullable_to_non_nullable
              as String,
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      task_title: freezed == task_title
          ? _value.task_title
          : task_title // ignore: cast_nullable_to_non_nullable
              as String?,
      terms_blob: freezed == terms_blob
          ? _value.terms_blob
          : terms_blob // ignore: cast_nullable_to_non_nullable
              as String?,
      terms_id: freezed == terms_id
          ? _value.terms_id
          : terms_id // ignore: cast_nullable_to_non_nullable
              as String?,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
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
      {List<String?>? assigned_to_ids,
      bool? auto_verify,
      int expiration_date,
      bool? marked_completed,
      String payment_method,
      String? project_id,
      String? project_name,
      int? rating,
      bool? requires_attachments,
      double reward_amount,
      String reward_currency,
      bool rewarded,
      String task_description,
      String task_id,
      String? task_title,
      String? terms_blob,
      String? terms_id,
      String user_id,
      @TimestampConverter() DateTime? timestamp});
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
    Object? assigned_to_ids = freezed,
    Object? auto_verify = freezed,
    Object? expiration_date = null,
    Object? marked_completed = freezed,
    Object? payment_method = null,
    Object? project_id = freezed,
    Object? project_name = freezed,
    Object? rating = freezed,
    Object? requires_attachments = freezed,
    Object? reward_amount = null,
    Object? reward_currency = null,
    Object? rewarded = null,
    Object? task_description = null,
    Object? task_id = null,
    Object? task_title = freezed,
    Object? terms_blob = freezed,
    Object? terms_id = freezed,
    Object? user_id = null,
    Object? timestamp = freezed,
  }) {
    return _then(_$_TaskModel(
      assigned_to_ids: freezed == assigned_to_ids
          ? _value._assigned_to_ids
          : assigned_to_ids // ignore: cast_nullable_to_non_nullable
              as List<String?>?,
      auto_verify: freezed == auto_verify
          ? _value.auto_verify
          : auto_verify // ignore: cast_nullable_to_non_nullable
              as bool?,
      expiration_date: null == expiration_date
          ? _value.expiration_date
          : expiration_date // ignore: cast_nullable_to_non_nullable
              as int,
      marked_completed: freezed == marked_completed
          ? _value.marked_completed
          : marked_completed // ignore: cast_nullable_to_non_nullable
              as bool?,
      payment_method: null == payment_method
          ? _value.payment_method
          : payment_method // ignore: cast_nullable_to_non_nullable
              as String,
      project_id: freezed == project_id
          ? _value.project_id
          : project_id // ignore: cast_nullable_to_non_nullable
              as String?,
      project_name: freezed == project_name
          ? _value.project_name
          : project_name // ignore: cast_nullable_to_non_nullable
              as String?,
      rating: freezed == rating
          ? _value.rating
          : rating // ignore: cast_nullable_to_non_nullable
              as int?,
      requires_attachments: freezed == requires_attachments
          ? _value.requires_attachments
          : requires_attachments // ignore: cast_nullable_to_non_nullable
              as bool?,
      reward_amount: null == reward_amount
          ? _value.reward_amount
          : reward_amount // ignore: cast_nullable_to_non_nullable
              as double,
      reward_currency: null == reward_currency
          ? _value.reward_currency
          : reward_currency // ignore: cast_nullable_to_non_nullable
              as String,
      rewarded: null == rewarded
          ? _value.rewarded
          : rewarded // ignore: cast_nullable_to_non_nullable
              as bool,
      task_description: null == task_description
          ? _value.task_description
          : task_description // ignore: cast_nullable_to_non_nullable
              as String,
      task_id: null == task_id
          ? _value.task_id
          : task_id // ignore: cast_nullable_to_non_nullable
              as String,
      task_title: freezed == task_title
          ? _value.task_title
          : task_title // ignore: cast_nullable_to_non_nullable
              as String?,
      terms_blob: freezed == terms_blob
          ? _value.terms_blob
          : terms_blob // ignore: cast_nullable_to_non_nullable
              as String?,
      terms_id: freezed == terms_id
          ? _value.terms_id
          : terms_id // ignore: cast_nullable_to_non_nullable
              as String?,
      user_id: null == user_id
          ? _value.user_id
          : user_id // ignore: cast_nullable_to_non_nullable
              as String,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_TaskModel implements _TaskModel {
  const _$_TaskModel(
      {final List<String?>? assigned_to_ids,
      this.auto_verify,
      required this.expiration_date,
      this.marked_completed,
      required this.payment_method,
      this.project_id,
      this.project_name,
      this.rating,
      this.requires_attachments,
      required this.reward_amount,
      required this.reward_currency,
      required this.rewarded,
      required this.task_description,
      required this.task_id,
      this.task_title,
      this.terms_blob,
      this.terms_id,
      required this.user_id,
      @TimestampConverter() this.timestamp})
      : _assigned_to_ids = assigned_to_ids;

  factory _$_TaskModel.fromJson(Map<String, dynamic> json) =>
      _$$_TaskModelFromJson(json);

  final List<String?>? _assigned_to_ids;
  @override
  List<String?>? get assigned_to_ids {
    final value = _assigned_to_ids;
    if (value == null) return null;
    if (_assigned_to_ids is EqualUnmodifiableListView) return _assigned_to_ids;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final bool? auto_verify;
  @override
  final int expiration_date;
  @override
  final bool? marked_completed;
  @override
  final String payment_method;
  @override
  final String? project_id;
  @override
  final String? project_name;
  @override
  final int? rating;
  @override
  final bool? requires_attachments;
  @override
  final double reward_amount;
  @override
  final String reward_currency;
  @override
  final bool rewarded;
  @override
  final String task_description;
  @override
  final String task_id;
  @override
  final String? task_title;
  @override
  final String? terms_blob;
  @override
  final String? terms_id;
  @override
  final String user_id;
  @override
  @TimestampConverter()
  final DateTime? timestamp;

  @override
  String toString() {
    return 'TaskModel(assigned_to_ids: $assigned_to_ids, auto_verify: $auto_verify, expiration_date: $expiration_date, marked_completed: $marked_completed, payment_method: $payment_method, project_id: $project_id, project_name: $project_name, rating: $rating, requires_attachments: $requires_attachments, reward_amount: $reward_amount, reward_currency: $reward_currency, rewarded: $rewarded, task_description: $task_description, task_id: $task_id, task_title: $task_title, terms_blob: $terms_blob, terms_id: $terms_id, user_id: $user_id, timestamp: $timestamp)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_TaskModel &&
            const DeepCollectionEquality()
                .equals(other._assigned_to_ids, _assigned_to_ids) &&
            (identical(other.auto_verify, auto_verify) ||
                other.auto_verify == auto_verify) &&
            (identical(other.expiration_date, expiration_date) ||
                other.expiration_date == expiration_date) &&
            (identical(other.marked_completed, marked_completed) ||
                other.marked_completed == marked_completed) &&
            (identical(other.payment_method, payment_method) ||
                other.payment_method == payment_method) &&
            (identical(other.project_id, project_id) ||
                other.project_id == project_id) &&
            (identical(other.project_name, project_name) ||
                other.project_name == project_name) &&
            (identical(other.rating, rating) || other.rating == rating) &&
            (identical(other.requires_attachments, requires_attachments) ||
                other.requires_attachments == requires_attachments) &&
            (identical(other.reward_amount, reward_amount) ||
                other.reward_amount == reward_amount) &&
            (identical(other.reward_currency, reward_currency) ||
                other.reward_currency == reward_currency) &&
            (identical(other.rewarded, rewarded) ||
                other.rewarded == rewarded) &&
            (identical(other.task_description, task_description) ||
                other.task_description == task_description) &&
            (identical(other.task_id, task_id) || other.task_id == task_id) &&
            (identical(other.task_title, task_title) ||
                other.task_title == task_title) &&
            (identical(other.terms_blob, terms_blob) ||
                other.terms_blob == terms_blob) &&
            (identical(other.terms_id, terms_id) ||
                other.terms_id == terms_id) &&
            (identical(other.user_id, user_id) || other.user_id == user_id) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        const DeepCollectionEquality().hash(_assigned_to_ids),
        auto_verify,
        expiration_date,
        marked_completed,
        payment_method,
        project_id,
        project_name,
        rating,
        requires_attachments,
        reward_amount,
        reward_currency,
        rewarded,
        task_description,
        task_id,
        task_title,
        terms_blob,
        terms_id,
        user_id,
        timestamp
      ]);

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
      {final List<String?>? assigned_to_ids,
      final bool? auto_verify,
      required final int expiration_date,
      final bool? marked_completed,
      required final String payment_method,
      final String? project_id,
      final String? project_name,
      final int? rating,
      final bool? requires_attachments,
      required final double reward_amount,
      required final String reward_currency,
      required final bool rewarded,
      required final String task_description,
      required final String task_id,
      final String? task_title,
      final String? terms_blob,
      final String? terms_id,
      required final String user_id,
      @TimestampConverter() final DateTime? timestamp}) = _$_TaskModel;

  factory _TaskModel.fromJson(Map<String, dynamic> json) =
      _$_TaskModel.fromJson;

  @override
  List<String?>? get assigned_to_ids;
  @override
  bool? get auto_verify;
  @override
  int get expiration_date;
  @override
  bool? get marked_completed;
  @override
  String get payment_method;
  @override
  String? get project_id;
  @override
  String? get project_name;
  @override
  int? get rating;
  @override
  bool? get requires_attachments;
  @override
  double get reward_amount;
  @override
  String get reward_currency;
  @override
  bool get rewarded;
  @override
  String get task_description;
  @override
  String get task_id;
  @override
  String? get task_title;
  @override
  String? get terms_blob;
  @override
  String? get terms_id;
  @override
  String get user_id;
  @override
  @TimestampConverter()
  DateTime? get timestamp;
  @override
  @JsonKey(ignore: true)
  _$$_TaskModelCopyWith<_$_TaskModel> get copyWith =>
      throw _privateConstructorUsedError;
}
