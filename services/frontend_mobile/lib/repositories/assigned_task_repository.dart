import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import '../bloc/generics/generic_bloc.dart';
import '../models/task_model/task_model.dart';
import '../screens/home/home_screen.dart';

// Get all tasks assigned to current user.
class AssignedTaskRepository extends GenericBlocRepository<TaskModel> {
  String uid = FirebaseAuth.instance.currentUser!.uid;
  @override
  Stream<List<TaskModel>> data() {
    final CollectionReference ref =
        FirebaseFirestore.instance.collection('test_tasks');
    final Query<Object> taskCollection = ref
        .where('assigned_to_ids', arrayContains: uid)
        .orderBy('expiration_date', descending: true)
        .limit(paginator2.value) as Query<Object>;

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
