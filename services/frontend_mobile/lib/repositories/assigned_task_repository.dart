import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import '../bloc/generics/generic_bloc.dart';
import '../models/task_model/task_model.dart';

/// Interface to our 'Task' Firebase collection.
///
/// Relies on a remote NoSQL document-oriented database.
class AssignedTaskRepository extends GenericBlocRepository<TaskModel> {
  String uid = FirebaseAuth.instance.currentUser!.uid;
  @override
  Stream<List<TaskModel>> data() {
    final Query<Object> taskCollection =
        FirebaseFirestore.instance.collection('test_tasks').where('assigned_to_ids', arrayContains: uid);

    // Get all tasks
    List<TaskModel> taskListFromSnapshot(QuerySnapshot<Object> snapshot) {
      try {
        final List<TaskModel> taskList =
            snapshot.docs.map((QueryDocumentSnapshot<Object> doc) {
          return TaskModel.fromJson(doc.data() as Map<String, dynamic>);
        }).toList();
        return taskList;
      } catch (e) {
        if (kDebugMode) {
          print('Error retrieving stream of all tasks: $e');
        }
        return <TaskModel>[];
      }
    }

    // get all users
    return taskCollection.snapshots().map(taskListFromSnapshot);
  }
}
