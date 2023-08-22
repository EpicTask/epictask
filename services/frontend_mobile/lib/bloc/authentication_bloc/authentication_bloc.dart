import 'package:epictask/models/user_event_model/user_event.dart';
import 'package:epictask/services/functions/firebase_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../repositories/user_repository.dart';
import '../../services/functions/test_api.dart';
import '../../services/functions/test_event_handler.dart';
import 'authentication_event.dart';
import 'authentication_state.dart';

// Authentication Bloc
class AuthenticationBloc
    extends Bloc<AuthenticationEvent, AuthenticationState> {
  AuthenticationBloc({required UserRepository userRepository})
      : _userRepository = userRepository,
        super(AuthenticationInitial()) {
    on<AuthenticationStarted>(
        (AuthenticationStarted event, Emitter<AuthenticationState> emit) async {
      final bool isSignedIn = await _userRepository.isSignedIn();
      if (isSignedIn) {
        try {
          final User? firebaseUser = _userRepository.getUser();
          if (firebaseUser != null) {
            UserEvent event =
                UserEvent(event_type: 'UserSignIn', user_id: currentUserID);
            FirestoreDatabase().writeUserEvent(event);
            handleTaskDefaultCalls(TASKCALL);
            emit(AuthenticationSuccess(firebaseUser));
          }
        } catch (e) {
          emit(AuthenticationFailure());
        }
      } else {
        emit(AuthenticationFailure());
      }
    });

    on<AuthenticationLoggedIn>((AuthenticationLoggedIn event,
        Emitter<AuthenticationState> emit) async {
      emit(AuthenticationSuccess(_userRepository.getUser()));
    });

    on<AuthenticationLoggedOut>((AuthenticationLoggedOut event,
        Emitter<AuthenticationState> emit) async {
      _userRepository.signOut();
            // UserEvent event =
            //     UserEvent(event_type: 'UserSignIn', user_id: currentUserID);
            // FirestoreDatabase().writeUserEvent(event);
      emit(AuthenticationFailure());
    });
  }
  final UserRepository _userRepository;
}
