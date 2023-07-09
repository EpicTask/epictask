// ignore_for_file: always_specify_types

import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

// import '../../services/firebase_functions/cloud_functions.dart';

class UserRepository {
  UserRepository() : _firebaseAuth = FirebaseAuth.instance;
  final FirebaseAuth _firebaseAuth;
  final GoogleSignIn googleSignIn = GoogleSignIn();
  final crashlytics = FirebaseCrashlytics.instance;

  Future<List<dynamic>> signOut() async {
    return Future.wait([_firebaseAuth.signOut()]);
  }

  Future<bool> isSignedIn() async {
    final User? currentUser = _firebaseAuth.currentUser;
    return currentUser != null;
  }

  Future<UserCredential> signInWithCredentials(
      {required String email, required String password}) async {
    return _firebaseAuth.signInWithEmailAndPassword(
        email: email, password: password);
  }
  
// Reset Password
  Future<bool> resetPassword(String email) async {
    try {
      final isRegisterEmail = await isRegistered(email);
      if (isRegisterEmail) {
        await _firebaseAuth.sendPasswordResetEmail(email: email);
        return true;
      }
    } catch (e) {
      crashlytics.log('Error resetting password: $e');
    }
    return false;
  }

  Future<bool> isRegistered(String email) async {
    try {
      final result = await _firebaseAuth.fetchSignInMethodsForEmail(email);
      return result.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  User? getUser() {
    return _firebaseAuth.currentUser;
  }

  String? getUserID() {
    return _firebaseAuth.currentUser?.uid;
  }

  void deleteUser(){
    _firebaseAuth.currentUser?.delete();
  }

  Stream<User?> get user =>
      _firebaseAuth.authStateChanges().map((User? user) => user);

  bool get appleSignInAvailable => Platform.isIOS;

  Future<UserCredential?> signInAnonymous() async {
    try {
      final result = await _firebaseAuth.signInAnonymously();
      return result;
    } catch (e) {
      crashlytics.log('Error signing in anonymously: $e');
      return null;
    }
  }

  Future<UserCredential?> signInWithApple() async {
    try {
      final AuthorizationCredentialAppleID appleCredential =
          await SignInWithApple.getAppleIDCredential(
              scopes: <AppleIDAuthorizationScopes>[
            AppleIDAuthorizationScopes.email,
            AppleIDAuthorizationScopes.fullName
          ]);

      final OAuthCredential credential = OAuthProvider('apple.com').credential(
        accessToken: appleCredential.authorizationCode,
        idToken: appleCredential.identityToken,
      );

      return await _firebaseAuth.signInWithCredential(credential);
    } catch (e) {
      crashlytics.log('Error in Apple sign in: $e');
      return null;
    }
  }

  Future<UserCredential?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleSignInAccount =
          await googleSignIn.signIn();
      final GoogleSignInAuthentication? googleSignInAuthentication =
          await googleSignInAccount?.authentication;

      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleSignInAuthentication?.accessToken,
        idToken: googleSignInAuthentication?.idToken,
      );

      final UserCredential authResult =
          await _firebaseAuth.signInWithCredential(credential);
      final User? user = authResult.user;

      assert(!user!.isAnonymous);
      assert(await user?.getIdToken() != null);

      final User? currentUser = _firebaseAuth.currentUser;
      assert(user?.uid == currentUser?.uid);

      return authResult;
    } catch (e) {
      crashlytics.log('Error in Google sign in: $e');
      return null;
    }
  }
}
