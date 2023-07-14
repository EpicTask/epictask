import 'package:epictask/models/user_model/user_model.dart';

abstract class ProfileState {}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileUpdated extends ProfileState {}

class ProfileLoaded extends ProfileState {
  final CurrentUserModel profile;

  ProfileLoaded({
    required this.profile
  });
}

class ProfileError extends ProfileState {
  final String errorMessage;

  ProfileError(this.errorMessage);
}
