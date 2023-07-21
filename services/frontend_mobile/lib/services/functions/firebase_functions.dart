import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dio/dio.dart';
import 'package:epictask/models/task_event_model/task_event.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../../models/user_event_model/user_event.dart';
import '../constants.dart';

final String currentUserID = FirebaseAuth.instance.currentUser!.uid;
final Dio dio = Dio();

// final Uri url = Uri.parse('http://0.0.0.0:8080/event');

class FirestoreDatabase {
  // Collection References
  CollectionReference<Object?> userEventsCollection =
      FirebaseFirestore.instance.collection('test_user_events');
  CollectionReference<Object?> taskEventsCollection =
      FirebaseFirestore.instance.collection('test_task_events');

  Future<void> writeUserEvent(UserEvent userEvent) async {
    try {
      String jsonData = json.encode(userEvent.toJson());
      final response = await dio.post(pubSuburl, data: jsonData);
      if (kDebugMode) {
        print('The data: $jsonData');
        print('The response: ${response.data}');
      }
    } on Exception catch (e) {
      if (kDebugMode) {
        print(e);
      }
    }
    final DocumentReference ref = userEventsCollection.doc();
    await ref.set(userEvent.toJson());
    await ref.update(<String, dynamic>{
      'timestamp': FieldValue.serverTimestamp(),
      'event_id': ref.id,
    });
  }

  Future<void> writeTaskEvent(TaskEvent taskEvent) async {
    try {
      String jsonData = json.encode(taskEvent.toJson());
      final response = await dio.post(pubSuburl, data: jsonData);
      if (kDebugMode) {
        print('The data: $jsonData');
        print('The response: ${response.data}');
      }
    } on Exception catch (e) {
      if (kDebugMode) {
        print(e);
      }
    }
    final DocumentReference ref = taskEventsCollection.doc();
    await ref.set(taskEvent.toJson());
    await ref.update(<String, dynamic>{
      'timestamp': FieldValue.serverTimestamp(),
      'event_id': ref.id,
    });
  }
}
