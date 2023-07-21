import 'dart:async';

import 'package:epictask/services/navigation/navigation.dart';
import 'package:epictask/services/service_config/service_config.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';

import '../../models/task_model/task_model.dart';
import '../users/all_users_modal.dart';
import 'logic/logic.dart';

// UI Cards for Open Tasks and Assigned Tasks
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
            Text(
                'Due Date: ${formatDate(DateTime.fromMillisecondsSinceEpoch(task.expiration_date * 1000))}',
                style: titleLarge(context)),
            if (task.assigned_to_ids?.isNotEmpty ?? false)
              FutureBuilder<String>(
                  future: getUserDisplayName(task.assigned_to_ids!.first),
                  builder: (context, snapshot) {
                    if (snapshot.hasData) {
                      String displayName = snapshot.data as String;
                      return Text('Assigned To: $displayName',
                          style: titleLarge(context));
                    }
                    return Text('Assigned To: Unknown User',
                        style: titleLarge(context));
                  }),
            if (task.marked_completed ?? false)
              Text('Marked Completed', style: titleLarge(context)),
            SizedBox(
              height: SizeConfig.screenHeight * .025,
            ),
            if (task.terms_blob?.isNotEmpty ?? false)
              Text('Conditions:', style: titleLarge(context)),
            Text(task.terms_blob ?? '', style: titleLarge(context)),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      completeTaskAndInitiatePayment(task);
                      Timer(const Duration(seconds: 3), () {
                        router.goNamed('payment', extra: task.task_id);
                      });
                      router.goNamed('loading');
                    },
                    child: Text(
                      'Pay',
                      style: titleMedium(context),
                    ),
                  ),
                  AllUserPage(
                    task: task,
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
            Text(
                'Due Date: ${formatDate(DateTime.fromMillisecondsSinceEpoch(task.expiration_date * 1000))}',
                style: titleLarge(context)),
            Text('Assigned To: Me', style: titleLarge(context)),
            if (task.marked_completed ?? false)
              Text('Marked Completed', style: titleLarge(context)),
            SizedBox(
              height: SizeConfig.screenHeight * .025,
            ),
            if (task.terms_blob?.isNotEmpty ?? false)
              Text('Conditions:', style: titleLarge(context)),
            Text(task.terms_blob ?? '', style: titleLarge(context)),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () => completeTask(task),
                    child: Text(
                      'Completed',
                      style: titleMedium(context),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
