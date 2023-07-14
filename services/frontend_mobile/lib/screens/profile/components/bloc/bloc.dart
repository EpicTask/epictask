import 'package:bloc/bloc.dart';
import 'package:epictask/models/user_model/user_model.dart';
import 'package:epictask/screens/profile/logic/logic.dart';
import 'package:epictask/services/functions/firebase_functions.dart';
import 'package:flutter/foundation.dart';

import 'event.dart';
import 'state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  ProfileBloc() : super(ProfileInitial()) {
    on<FetchUserProfile>((FetchUserProfile event, emit) async {
      try {
        CurrentUserModel profile = await getUserProfile(currentUserID);
        emit(ProfileLoaded(profile: profile));
      } catch (e) {
        emit(ProfileError(e.toString()));
        if (kDebugMode) {
          print(e);
        }
      }
    });
    on<UpdateDisplayName>((UpdateDisplayName event, emit) {
      try {
        updateProfile('displayName', event.updatedDisplayName);
        emit(ProfileUpdated());
      } catch (e) {
        emit(ProfileError(e.toString()));
                if (kDebugMode) {
          print(e);
        }
      }
    });
    on<UpdatePublicAddress>((UpdatePublicAddress event, emit) {
      try {
        updateProfile('publicAddress', event.updatedPublicAddress);
        emit(ProfileUpdated());
      } catch (e) {
        emit(ProfileError(e.toString()));
                if (kDebugMode) {
          print(e);
        }
      }
    });
    on<UpdateImage>((UpdateImage event, emit) {
      try {
        updateProfile('imageUrl', event.image);
        emit(ProfileUpdated());
      } catch (e) {
        emit(ProfileError(e.toString()));
                if (kDebugMode) {
          print(e);
        }
      }
    });
  }
}
