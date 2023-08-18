import 'package:flutter/material.dart';

import '../../models/task_model/task_model.dart';
import '../../services/service_config/service_config.dart';
import '../../services/ui/text_styles.dart';
import 'components/ui_layout.dart';
import 'logic/logic.dart';
import 'task_card.dart';

class TaskCardAssigned extends StatelessWidget {
  final TaskModel task;

  const TaskCardAssigned({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return TaskCardShape(
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
          Tooltip(
              message: task.terms_blob ?? '',
              child: Text(
                task.terms_blob ?? '',
                style: titleLarge(context),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              )),
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
    );
  }
}