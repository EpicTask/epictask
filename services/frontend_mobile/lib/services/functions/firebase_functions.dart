import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dio/dio.dart';
import 'package:epictask/models/task_event_model/task_event.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import '../../models/user_event_model/user_event.dart';
import 'test_event_handler.dart';

final String currentUserID = FirebaseAuth.instance.currentUser?.uid ?? '';
final Dio dio = Dio();

class FirestoreDatabase {
  // Collection References
  CollectionReference<Object?> userEventsCollection =
      FirebaseFirestore.instance.collection('test_user_events');
  CollectionReference<Object?> taskEventsCollection =
      FirebaseFirestore.instance.collection('test_task_events');
  CollectionReference<Object?> usersCollection =
      FirebaseFirestore.instance.collection('users');

  Future<void> writeUserEvent(UserEvent userEvent) async {
    final DocumentReference ref = userEventsCollection.doc();
    await ref.set(userEvent.toJson());
    await ref.update(<String, dynamic>{
      'timestamp': FieldValue.serverTimestamp(),
      'event_id': ref.id,
    });
  }

  Future<void> writeTaskEvent(TaskEvent taskEvent) async {
    taskEventHandler(taskEvent);
    final DocumentReference ref = taskEventsCollection.doc();
    await ref.set(taskEvent.toJson());
    await ref.update(<String, dynamic>{
      'timestamp': FieldValue.serverTimestamp(),
      'event_id': ref.id,
    });
  }

// User Registration
  Future<void> createUserAccount(
      String email, String? displayName, String? imageUrl, String uid) async {
    final DocumentReference ref = usersCollection.doc(uid);
    try {
      await ref.set({
        'email': email,
        'displayName': displayName ?? "user${uid.substring(23)}",
        'imageUrl': imageUrl,
        'dateCreated': FieldValue.serverTimestamp(),
        'uid': uid,
      });
    } catch (e) {
      if (kDebugMode) {
        print('Error Creating new account: $e');
      }
    }
  }
}