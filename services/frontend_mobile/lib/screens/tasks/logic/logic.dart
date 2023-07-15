import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';

import '../../../models/task_event_model/task_event.dart';
import '../../../models/task_model/task_model.dart';
import '../../../services/functions/firebase_functions.dart';

Future<String> getUserDisplayName(String? uid) async {
  if (uid?.isNotEmpty ?? false) {
    DocumentSnapshot snapshot =
        await FirebaseFirestore.instance.collection('users').doc(uid).get();
    if (snapshot.exists) {
      dynamic data = snapshot.data();
      String? displayName = data['displayName'] as String?;
      return displayName ?? '';
    }
  }
  return '';
}

completeTask(
  TaskModel task,
) {
  final TaskCompleted event = TaskCompleted(
      completed_by_id: task.assigned_to_ids?.first ?? '',
      task_id: task.task_id,
      marked_completed:
          task.marked_completed == null ? true : !task.marked_completed!);
  final TaskEvent taskEvent = TaskEvent.defaultEvent().copyWith(
      additional_data: event.toJson(),
      event_type: 'TaskCompleted',
      task_id: task.task_id,
      user_id: currentUserID);
  FirestoreDatabase().writeTaskEvent(taskEvent);
}

assignTask(taskId) {
  final TaskAssigned event =
      TaskAssigned(task_id: taskId, assigned_to_ids: currentUserID);
  final TaskEvent taskEvent = TaskEvent.defaultEvent().copyWith(
      additional_data: event.toJson(),
      event_type: 'TaskAssigned',
      user_id: currentUserID);
  FirestoreDatabase().writeTaskEvent(taskEvent);
}

deleteTask(taskId) {
  final TaskCancelled event = TaskCancelled(task_id: taskId);
  final TaskEvent taskEvent = TaskEvent.defaultEvent().copyWith(
      additional_data: event.toJson(),
      event_type: 'TaskCancelled',
      user_id: currentUserID);
  FirestoreDatabase().writeTaskEvent(taskEvent);
}

String formatDate(DateTime date) {
  if (date.year == DateTime.now().year &&
      date.month == DateTime.now().month &&
      date.day == DateTime.now().day) {
    return 'Today';
  } else if (date.year == DateTime.now().year &&
      date.month == DateTime.now().month &&
      date.day == DateTime.now().day + 1) {
    return 'Tomorrow';
  } else {
    return DateFormat('MM/dd/yyyy').format(date);
  }
}
