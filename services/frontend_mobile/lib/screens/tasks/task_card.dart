import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../models/task_model/task_model.dart';
import 'logic/logic.dart';

class TaskCard extends StatelessWidget {
  final TaskModel task;

  const TaskCard({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Container(
        padding: const EdgeInsets.all(8.0),
        margin: const EdgeInsets.symmetric(vertical: 8.0),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey, width: 4),
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(task.task_description, style: titleLarge(context)),
            Text('Reward: ${task.reward_amount} ${task.reward_currency}',
                style: titleLarge(context)),
            Text('Due Date: ${formatDate(DateTime.fromMillisecondsSinceEpoch(task.expiration_date))}',
                style: titleLarge(context)),
            if (task.assigned_to_ids?.isNotEmpty ?? false)
              FutureBuilder<String>(
                future: getUserDisplayName(task.assigned_to_ids!.first),
                builder: (context, snapshot) {
                  if(snapshot.hasData){
                    String displayName = snapshot.data as String;
                    return Text('Assigned To: $displayName',
                      style: titleLarge(context));
                  }
                  return Text('Assigned To: Unknown User',
                      style: titleLarge(context));
                }
              ),
            if (task.marked_completed ?? false)
              Text('Marked Completed', style: titleLarge(context)),
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () => completeTask(task, task.user_id),
                    child: Text(
                      'Completed',
                      style: titleMedium(context),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => assignTask(task.task_id),
                    child: Text('Assign', style: titleMedium(context)),
                  ),
                  ElevatedButton(
                    onPressed: () => deleteTask(task.task_id),
                    child: Text('Delete', style: titleMedium(context)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  completeTask(TaskModel task, String userId) {}

  assignTask(taskId) {}

  deleteTask(taskId) {}
}

class TaskCardAssigned extends StatelessWidget {
  final TaskModel task;

  const TaskCardAssigned({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Container(
        padding: const EdgeInsets.all(8.0),
        margin: const EdgeInsets.symmetric(vertical: 8.0),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey, width: 2),
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              task.task_description,
              style: titleLarge(context),
            ),
            Text('Reward: ${task.reward_amount} ${task.reward_currency}',
                style: titleLarge(context)),
            Text('Due Date: ${formatDate(DateTime.fromMillisecondsSinceEpoch(task.expiration_date))}',
                style: titleLarge(context)),
            Text('Assigned To: Me', style: titleLarge(context)),
            if (task.marked_completed ?? false)
              Text('Marked Completed', style: titleLarge(context)),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () => completeTask(task, task.user_id),
                  child: Text('Completed', style: titleMedium(context)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  completeTask(TaskModel task, String userId) {}

  assignTask(taskId) {}

  deleteTask(taskId) {}
}

class UserList extends StatelessWidget {
  // final bool showModal;
  // final String taskId;
  // final Function closeModal;

  const UserList({
    super.key,
    // required this.showModal,
    // required this.taskId,
    // required this.closeModal
  });

  @override
  Widget build(BuildContext context) {
    // Implement your UserList widget logic and UI here
    return const Placeholder();
  }
}

// Other necessary classes and functions

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
