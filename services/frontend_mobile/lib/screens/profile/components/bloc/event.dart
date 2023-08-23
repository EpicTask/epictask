
import 'package:epictask/models/user_model/user_model.dart';

abstract class ProfileEvent {}

class FetchUserProfile extends ProfileEvent {}

class UpdateDisplayName extends ProfileEvent {
  final String updatedDisplayName;

  UpdateDisplayName(this.updatedDisplayName);
}

class UpdatePublicAddress extends ProfileEvent {
  final String updatedPublicAddress;

  UpdatePublicAddress(this.updatedPublicAddress);
}

class UpdateImage extends ProfileEvent {
  final dynamic image;

  UpdateImage(this.image);
}

class CurrentProfileHasDataEvent extends ProfileEvent {

  CurrentProfileHasDataEvent(this.data);
  final CurrentUserModel data;

  List<Object> get props => <Object>[data];
}