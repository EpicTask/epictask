import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

import '../bloc/generics/generic_bloc.dart';
import '../models/leaderboard_model/leaderboard_model.dart';
import '../screens/home/home_screen.dart';

/// Interface to our Leaderboard Firebase collection.
class LeaderboardRepository extends GenericBlocRepository<LeaderboardModel> {
  @override
  Stream<List<LeaderboardModel>> data() {
    final CollectionReference ref =
        FirebaseFirestore.instance.collection('test_leaderboard');
    final Query<Object> leaderboardCollection =
        ref.limit(paginator3.value) as Query<Object>;

    // Get list with pagination
    List<LeaderboardModel> leaderListFromSnapshot(
        QuerySnapshot<Object> snapshot) {
      try {
        final List<LeaderboardModel> leaderList =
            snapshot.docs.map((QueryDocumentSnapshot<Object> doc) {
          return LeaderboardModel.fromJson(doc.data() as Map<String, dynamic>);
        }).toList();
        return leaderList;
      } catch (e) {
        if (kDebugMode) {
          print('Error retrieving stream of items with pagination: $e');
        }
        return <LeaderboardModel>[];
      }
    }

    return leaderboardCollection.snapshots().map(leaderListFromSnapshot);
  }
}
