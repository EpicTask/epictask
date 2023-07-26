// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'contract_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#custom-getters-and-methods');

ContractModel _$ContractModelFromJson(Map<String, dynamic> json) {
  return _ContractModel.fromJson(json);
}

/// @nodoc
mixin _$ContractModel {
  String? get contract => throw _privateConstructorUsedError;
  @TimestampConverter()
  DateTime? get timestamp => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ContractModelCopyWith<ContractModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ContractModelCopyWith<$Res> {
  factory $ContractModelCopyWith(
          ContractModel value, $Res Function(ContractModel) then) =
      _$ContractModelCopyWithImpl<$Res, ContractModel>;
  @useResult
  $Res call({String? contract, @TimestampConverter() DateTime? timestamp});
}

/// @nodoc
class _$ContractModelCopyWithImpl<$Res, $Val extends ContractModel>
    implements $ContractModelCopyWith<$Res> {
  _$ContractModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? contract = freezed,
    Object? timestamp = freezed,
  }) {
    return _then(_value.copyWith(
      contract: freezed == contract
          ? _value.contract
          : contract // ignore: cast_nullable_to_non_nullable
              as String?,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$_ContractModelCopyWith<$Res>
    implements $ContractModelCopyWith<$Res> {
  factory _$$_ContractModelCopyWith(
          _$_ContractModel value, $Res Function(_$_ContractModel) then) =
      __$$_ContractModelCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String? contract, @TimestampConverter() DateTime? timestamp});
}

/// @nodoc
class __$$_ContractModelCopyWithImpl<$Res>
    extends _$ContractModelCopyWithImpl<$Res, _$_ContractModel>
    implements _$$_ContractModelCopyWith<$Res> {
  __$$_ContractModelCopyWithImpl(
      _$_ContractModel _value, $Res Function(_$_ContractModel) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? contract = freezed,
    Object? timestamp = freezed,
  }) {
    return _then(_$_ContractModel(
      contract: freezed == contract
          ? _value.contract
          : contract // ignore: cast_nullable_to_non_nullable
              as String?,
      timestamp: freezed == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$_ContractModel implements _ContractModel {
  const _$_ContractModel({this.contract, @TimestampConverter() this.timestamp});

  factory _$_ContractModel.fromJson(Map<String, dynamic> json) =>
      _$$_ContractModelFromJson(json);

  @override
  final String? contract;
  @override
  @TimestampConverter()
  final DateTime? timestamp;

  @override
  String toString() {
    return 'ContractModel(contract: $contract, timestamp: $timestamp)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$_ContractModel &&
            (identical(other.contract, contract) ||
                other.contract == contract) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, contract, timestamp);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$_ContractModelCopyWith<_$_ContractModel> get copyWith =>
      __$$_ContractModelCopyWithImpl<_$_ContractModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$_ContractModelToJson(
      this,
    );
  }
}

abstract class _ContractModel implements ContractModel {
  const factory _ContractModel(
      {final String? contract,
      @TimestampConverter() final DateTime? timestamp}) = _$_ContractModel;

  factory _ContractModel.fromJson(Map<String, dynamic> json) =
      _$_ContractModel.fromJson;

  @override
  String? get contract;
  @override
  @TimestampConverter()
  DateTime? get timestamp;
  @override
  @JsonKey(ignore: true)
  _$$_ContractModelCopyWith<_$_ContractModel> get copyWith =>
      throw _privateConstructorUsedError;
}
