import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:epictask/models/task_model/task_model.dart';
import 'package:epictask/models/user_event_model/user_event.dart';
import 'package:epictask/services/functions/firebase_functions.dart';
import 'package:flutter/foundation.dart';

import '../../models/task_event_model/task_event.dart';
import 'package:http/http.dart' as http;


void handleUserCalls(String userManagementUrl, UserEvent event) async {
  dynamic message = jsonEncode(event.toJson()['additional_data']);
  if (kDebugMode) {
    print(message);
  }
  try {
    http.Response response = await http.post(Uri.parse(userManagementUrl),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: message);
    if (response.statusCode == 200) {
      if (kDebugMode) {
        print('API response: ${response.body}');
      }
      // Handle the API response or perform any additional actions
    } else {
      if (kDebugMode) {
        print('API call error: ${response.statusCode}');
      }
      // Handle the API call error
    }
  } catch (error) {
    if (kDebugMode) {
      print('API call error: $error');
    }
    // Handle the API call error
  }

  if (kDebugMode) {
    print('Message received: $message');
  }
}

void handleTaskCalls(String taskManagementUrl, TaskEvent event) async {
  dynamic message = jsonEncode(event.toJson()['additional_data']);
  if (kDebugMode) {
    print(message);
  }
  try {
    http.Response response = await http.post(Uri.parse(taskManagementUrl),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: message);
    if (response.statusCode == 200) {
      if (kDebugMode) {
        print('API response: ${response.body}');
      }
      // Handle the API response or perform any additional actions
    } else {
      if (kDebugMode) {
        print('API call error: ${response.statusCode}');
      }
      // Handle the API call error
    }
  } catch (error) {
    if (kDebugMode) {
      print('API call error: $error');
    }
    // Handle the API call error
  }

  if (kDebugMode) {
    print('Message received: $message');
  }
}

Future<String> generateContract(TaskModel task) async {
  dynamic message = TaskEvent.defaultEvent()
      .copyWith(
          task_id: task.task_id,
          user_id: task.user_id,
          additional_data: task
              .copyWith(
                timestamp: null,
              )
              .toJson())
      .toJson();
  try {
    final HttpsCallable callable =
        FirebaseFunctions.instance.httpsCallable('generateContract');
    final String response =
        await callable(message).then((result) => result.data);
    if (response.isNotEmpty) {
      TaskEvent event = TaskEvent.defaultEvent().copyWith(
          additional_data: TaskUpdated(
              task_id: task.task_id,
              updated_fields: {'terms_id': response}).toJson(),
          event_type: 'TaskUpdated',
          task_id: task.task_id,
          user_id: currentUserID);
      FirestoreDatabase().writeTaskEvent(event);
    } else {
      if (kDebugMode) {
        print('API call error');
      }
      // Handle the API call error
    }
  } on FirebaseFunctionsException catch (error) {
    if (kDebugMode) {
      print(error.code);
      print(error.details);
      print(error.message);
    }
  }
  return '';
}

void deleteContract(String docId, String taskId) {
  CollectionReference<Object?> testContractsCollection =
      FirebaseFirestore.instance.collection('test_contracts');
  testContractsCollection.doc(docId).delete();
  TaskEvent event = TaskEvent.defaultEvent().copyWith(
      additional_data:
          TaskUpdated(task_id: taskId, updated_fields: {'terms_id': ""})
              .toJson(),
      event_type: 'TaskUpdated',
      task_id: taskId,
      user_id: currentUserID);
  FirestoreDatabase().writeTaskEvent(event);
}
