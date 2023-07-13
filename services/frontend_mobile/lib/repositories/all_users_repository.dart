import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

import '../bloc/generics/generic_bloc.dart';
import '../models/user_model/user_model.dart';

/// Get all users
class AllUserRepository extends GenericBlocRepository<UserModel> {
  @override
  Stream<List<UserModel>> data() {
    final CollectionReference<Object> userCollection =
        FirebaseFirestore.instance.collection('users');
    List<UserModel> userListFromSnapshot(QuerySnapshot<Object> snapshot) {
      try {
        List<UserModel> userList =
            snapshot.docs.map((QueryDocumentSnapshot<Object?> doc) {
          return UserModel.fromJson(doc.data() as Map<String, dynamic>);
        }).toList();

        return userList;
      } catch (e) {
        if (kDebugMode) {
          print('Error retrieving stream of all users: $e');
        }
        return <UserModel>[];
      }
    }

    // get all users
    return userCollection.snapshots().map(userListFromSnapshot);
  }
}
