import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:epictask/models/user_event_model/user_event.dart';
import 'package:flutter/foundation.dart';

import '../../models/task_event_model/task_event.dart';

final Dio _dio = Dio();

void handleUserCalls(String userManagementUrl, UserEvent event) async {
  dynamic message = json.encode(event.additional_data);
  try {
    final Response response = await _dio.post(
      userManagementUrl,
      data: message,
    );

    if (response.statusCode == 200) {
      if (kDebugMode) {
        print('API response: ${response.data}');
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
  print(taskManagementUrl);
  dynamic message = json.encode(event.additional_data);
  try {
    final Response response = await _dio.post(
      taskManagementUrl,
      data: message,
    );

    if (response.statusCode == 200) {
      if (kDebugMode) {
        print('API response: ${response.data}');
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
