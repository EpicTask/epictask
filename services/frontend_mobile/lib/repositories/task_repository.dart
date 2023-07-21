import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import '../bloc/generics/generic_bloc.dart';
import '../models/task_model/task_model.dart';
import '../screens/home/home_screen.dart';

/// Interface to our Task Firebase collection.
class TaskRepository extends GenericBlocRepository<TaskModel> {
  String uid = FirebaseAuth.instance.currentUser!.uid;

  @override
  Stream<List<TaskModel>> data({int? lastDocumentInt}) {
    final CollectionReference ref =
        FirebaseFirestore.instance.collection('test_tasks');
    final Query<Object> taskCollection = ref
        .where('user_id', isEqualTo: uid)
        .orderBy('expiration_date', descending: true)
        .limit(paginator.value) as Query<Object>;

    // Get tasks with pagination
    List<TaskModel> taskListFromSnapshot(QuerySnapshot<Object> snapshot) {
      try {
        final List<TaskModel> taskList =
            snapshot.docs.map((QueryDocumentSnapshot<Object> doc) {
          return TaskModel.fromJson(doc.data() as Map<String, dynamic>);
        }).toList();
        return taskList;
      } catch (e) {
        if (kDebugMode) {
          print('Error retrieving stream of tasks with pagination: $e');
        }
        return <TaskModel>[];
      }
    }

    return taskCollection.snapshots().map(taskListFromSnapshot);
  }
}
