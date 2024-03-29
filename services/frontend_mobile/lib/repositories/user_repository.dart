// ignore_for_file: always_specify_types

import 'dart:io';

import 'package:epictask/services/functions/firebase_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

class UserRepository {
  UserRepository() : _firebaseAuth = FirebaseAuth.instance;
  final FirebaseAuth _firebaseAuth;

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

  Future<void> signUp(
      String email, String password, String? displayName) async {
    final UserCredential result = await _firebaseAuth
        .createUserWithEmailAndPassword(email: email, password: password);
    final User? user = result.user;
    if (user != null) {
      String uid = user.uid;
      FirestoreDatabase()
          .createUserAccount(email, displayName, user.photoURL, uid);
    }
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
      if (kDebugMode) {
        print('Error resetting password: $e');
      }
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

  void deleteUser() {
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
      if (kDebugMode) {
        print('Error signing in anonymously: $e');
      }
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
      if (kDebugMode) {
        print('Error in Apple sign in: $e');
      }
      return null;
    }
  }

  Future<UserCredential?> signInWithGoogle() async {
    final GoogleSignIn googleSignIn = GoogleSignIn();
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
      if (kDebugMode) {
        print('Error in Google sign in: $e');
      }
      return null;
    }
  }
}
