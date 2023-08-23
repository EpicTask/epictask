import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:epictask/models/user_model/user_model.dart';
import 'package:epictask/services/functions/firebase_functions.dart';
import 'package:flutter/foundation.dart';

/// Interface to our 'userPublicProfile' Firebase collection.
/// It contains the public profile infos for all users.
///
/// Relies on a remote NoSQL document-oriented database.
class CurrentUserProfileRepository {
  final CollectionReference<Object> userProfileCollection =
      FirebaseFirestore.instance.collection('users');
  final StreamController<CurrentUserModel> _loadedData =
      StreamController<CurrentUserModel>.broadcast();

  void dispose() {
    _loadedData.close();
  }

  void refresh() {

    // Get Public Profile
    CurrentUserModel userProfileFromSnapshot(
        DocumentSnapshot<Object> snapshot) {
      if (snapshot.exists) {
        try {
          return CurrentUserModel.fromJson(
              snapshot.data() as Map<String, dynamic>);
        } catch (e) {
          if (kDebugMode) {
            print('Error in Repo: $e');
          }
          return defaultUserModel2;
        }
      } else {
        if (kDebugMode) {
          print('Dont exist');
        }
        return defaultUserModel2;
      }
    }

    final Stream<CurrentUserModel> profile = userProfileCollection
        .doc(currentUserID)
        .snapshots()
        .map(userProfileFromSnapshot);

    _loadedData.addStream(profile);
  }

  Stream<CurrentUserModel> profile() => _loadedData.stream;
}
