import 'package:epictask/models/user_event_model/user_event.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../repositories/user_repository.dart';
import '../../services/functions/firebase_functions.dart';
import '../../services/utils/validators.dart';
import 'event.dart';
import 'state.dart';

class LoginBloc extends Bloc<LoginEvent, LoginState> {
  LoginBloc({UserRepository? userRepository})
      : _userRepository = userRepository,
        super(LoginState.initial()) {
    on<LoginEmailChange>(
        (LoginEmailChange event, Emitter<LoginState> emit) async =>
            emit(state.update(isEmailValid: isValidEmail(event.email!))));

    on<LoginPasswordChanged>((LoginPasswordChanged event,
            Emitter<LoginState> emit) async =>
        emit(state.update(isPasswordValid: isValidPassword(event.password!))));
    on<LoginWithCredentialsPressed>(
        (LoginWithCredentialsPressed event, Emitter<LoginState> emit) async {
      emit(LoginState.loading());
      try {
        final UserCredential? firebaseUser =
            await _userRepository?.signInWithCredentials(
                email: event.email!, password: event.password!);
        if (firebaseUser!.user!.uid.isNotEmpty) {
          UserSignInEvent data = const UserSignInEvent(
            status: 'Success',
            social: false,
          );
          UserEvent newEvent = UserEvent(
              event_type: 'userSignIn',
              user_id: currentUserID,
              additional_data: data.toJson());
          FirestoreDatabase().writeUserEvent(newEvent);
          emit(LoginState.success());
        }
        // AuthenticationSuccess(firebaseUser.user);
      } catch (_) {
        UserSignInEvent data = const UserSignInEvent(
          status: 'Success',
          social: false,
        );
        UserEvent newEvent = UserEvent(
            event_type: 'userSignIn',
            user_id: currentUserID,
            additional_data: data.toJson());
        FirestoreDatabase().writeUserEvent(newEvent);
        emit(LoginState.failure());
        if (kDebugMode) {
          print('Failed to login: $_');
        }
      }
    });
    on<LoginWithApplePressed>(
        (LoginWithApplePressed event, Emitter<LoginState> emit) async {
      emit(LoginState.loading());
      try {
        final UserCredential? user = await _userRepository?.signInWithApple();
        if (user!.user!.uid.isNotEmpty) {
          UserSignInEvent data = const UserSignInEvent(
              status: 'Success', social: true, social_type: 'apple');
          UserEvent newEvent = UserEvent(
              event_type: 'userSignIn',
              user_id: currentUserID,
              additional_data: data.toJson());
          FirestoreDatabase().writeUserEvent(newEvent);
          emit(LoginState.success());
        }
      } catch (_) {
        UserSignInEvent data = const UserSignInEvent(
            status: 'Failed', social: true, social_type: 'apple');
        UserEvent newEvent = UserEvent(
            event_type: 'userSignIn',
            user_id: currentUserID,
            additional_data: data.toJson());
        FirestoreDatabase().writeUserEvent(newEvent);
        emit(LoginState.failure());
      }
    });
    on<LoginWithGooglePressed>(
        (LoginWithGooglePressed event, Emitter<LoginState> emit) async {
      emit(LoginState.loading());
      try {
        final UserCredential? user = await _userRepository?.signInWithGoogle();
        if (user!.user!.uid.isNotEmpty) {
          UserSignInEvent data = const UserSignInEvent(
              status: 'Success', social: true, social_type: 'google');
          UserEvent newEvent = UserEvent(
              event_type: 'userSignIn',
              user_id: currentUserID,
              additional_data: data.toJson());
          FirestoreDatabase().writeUserEvent(newEvent);
          emit(LoginState.success());
        }
      } catch (_) {
        UserSignInEvent data = const UserSignInEvent(
            status: 'Failed', social: true, social_type: 'google');
        UserEvent newEvent = UserEvent(
            event_type: 'userSignIn',
            user_id: currentUserID,
            additional_data: data.toJson());
        FirestoreDatabase().writeUserEvent(newEvent);
        emit(LoginState.failure());
      }
    });
        on<LoginAnonymousPressed>(
        (LoginAnonymousPressed event, Emitter<LoginState> emit) async {
      emit(LoginState.loading());
      try {
        final UserCredential? user = await _userRepository?.signInAnonymous();
        if (user!.user!.uid.isNotEmpty) {
          emit(LoginState.success());
        }
      } catch (_) {
        emit(LoginState.failure());
      }
    });
  }
  final UserRepository? _userRepository;
}
