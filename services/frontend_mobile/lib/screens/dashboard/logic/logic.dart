import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../../models/task_model/task_model.dart';

// Get tasks assigned to current user.
Future<List<TaskModel>> getMyTasks() async {
  String uid = FirebaseAuth.instance.currentUser!.uid;
  final Query<Object> taskCollection = FirebaseFirestore.instance
      .collection('test_tasks')
      .where('assigned_to_ids', arrayContains: uid);

  // Get all tasks
  QuerySnapshot<Object> snapshot = await taskCollection.get();
  try {
    final List<TaskModel> taskList =
        snapshot.docs.map((QueryDocumentSnapshot<Object> doc) {
      return TaskModel.fromJson(doc.data() as Map<String, dynamic>);
    }).toList();
    return taskList;
  } catch (e) {
    if (kDebugMode) {
      print('Error retrieving future of all tasks: $e');
    }
    return <TaskModel>[];
  }
}

// API call to retrieve USD value of XRP
Future<double?> getUSDValue() async {
  const String baseURL =
      "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd";

  SharedPreferences prefs = await SharedPreferences.getInstance();
  DateTime? lastUpdateTime =
      DateTime.tryParse(prefs.getString('lastUpdateTime') ?? '');

  if (lastUpdateTime == null ||
      DateTime.now().difference(lastUpdateTime).inDays >= 1) {
    try {
      final http.Response response = await http.get(Uri.parse(baseURL));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        double usdValue = data['ripple']['usd'];

        // Store the retrieved value and the current time as the last update time
        prefs.setDouble('usdValue', usdValue);
        prefs.setString('lastUpdateTime', DateTime.now().toIso8601String());

        return usdValue;
      } else {
        throw Exception(
            'Error: Request failed, status code ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  } else {
    // Return the cached value if it is still within one day
    double? cachedValue = prefs.getDouble('usdValue');
    return cachedValue;
  }
}

// Sum up the reward amount
double sumRewardAmount(List<TaskModel> tasks) {
  double sum = 0;

  for (var task in tasks) {
    sum += task.reward_amount;
  }

  return sum;
}
