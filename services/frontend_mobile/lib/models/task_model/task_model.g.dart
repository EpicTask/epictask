// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'task_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$_TaskModel _$$_TaskModelFromJson(Map<String, dynamic> json) => _$_TaskModel(
      assigned_to_ids: (json['assigned_to_ids'] as List<dynamic>?)
          ?.map((e) => e as String?)
          .toList(),
      auto_verify: json['auto_verify'] as bool?,
      expiration_date: json['expiration_date'] as int,
      marked_completed: json['marked_completed'] as bool?,
      payment_method: json['payment_method'] as String,
      project_id: json['project_id'] as String?,
      project_name: json['project_name'] as String?,
      rating: json['rating'] as int?,
      requires_attachments: json['requires_attachments'] as bool?,
      reward_amount: (json['reward_amount'] as num).toDouble(),
      reward_currency: json['reward_currency'] as String,
      rewarded: json['rewarded'] as bool,
      task_description: json['task_description'] as String,
      task_id: json['task_id'] as String,
      task_title: json['task_title'] as String?,
      terms_blob: json['terms_blob'] as String?,
      terms_id: json['terms_id'] as String?,
      smart_contract_enabled: json['smart_contract_enabled'] as bool?,
      user_id: json['user_id'] as String,
      timestamp: _$JsonConverterFromJson<Timestamp, DateTime>(
          json['timestamp'], const TimestampConverter().fromJson),
    );

Map<String, dynamic> _$$_TaskModelToJson(_$_TaskModel instance) =>
    <String, dynamic>{
      'assigned_to_ids': instance.assigned_to_ids,
      'auto_verify': instance.auto_verify,
      'expiration_date': instance.expiration_date,
      'marked_completed': instance.marked_completed,
      'payment_method': instance.payment_method,
      'project_id': instance.project_id,
      'project_name': instance.project_name,
      'rating': instance.rating,
      'requires_attachments': instance.requires_attachments,
      'reward_amount': instance.reward_amount,
      'reward_currency': instance.reward_currency,
      'rewarded': instance.rewarded,
      'task_description': instance.task_description,
      'task_id': instance.task_id,
      'task_title': instance.task_title,
      'terms_blob': instance.terms_blob,
      'terms_id': instance.terms_id,
      'smart_contract_enabled': instance.smart_contract_enabled,
      'user_id': instance.user_id,
      'timestamp': _$JsonConverterToJson<Timestamp, DateTime>(
          instance.timestamp, const TimestampConverter().toJson),
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
