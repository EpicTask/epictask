
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
