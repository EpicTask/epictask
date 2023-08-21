import 'package:flutter/material.dart';

import '../../models/task_model/task_model.dart';
import '../../services/ui/text_styles.dart';
import 'components/ui_layout.dart';
import 'logic/logic.dart';
import 'task_card.dart';

class TaskCardAssignedWeb extends StatelessWidget {
  final TaskModel task;

  const TaskCardAssignedWeb({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return TaskCardShape(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CardTitleAssigned(
            task: task,
          ),
          Expanded(
              flex: 2,
              child: CardBody(
                task: task,
              )),
          AssignedCardButtons(
            task: task,
          ),
        ],
      ),
    );
  }
}

class TaskCardAssigned extends StatelessWidget {
  final TaskModel task;

  const TaskCardAssigned({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return TaskCardShape(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CardTitleAssigned(
            task: task,
          ),
          CardBody(
            task: task,
          ),
          AssignedCardButtons(
            task: task,
          ),
        ],
      ),
    );
  }
}

class CardTitleAssigned extends StatelessWidget {
  const CardTitleAssigned({
    super.key,
    required this.task,
  });

  final TaskModel task;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(task.task_description, style: headlineSmall(context)),
      subtitle: Text(
        'Due: ${formatDate(DateTime.fromMillisecondsSinceEpoch(task.expiration_date * 1000))}',
        style: titleMedium(context),
      ),
    );
  }
}

class AssignedCardButtons extends StatelessWidget {
  const AssignedCardButtons({
    super.key,
    required this.task,
  });

  final TaskModel task;

  @override
  Widget build(BuildContext context) {
    return Center(
          child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                onPressed: () => completeTask(task),
                child: Text(
                  'Completed',
                  style: titleMedium(context),
                ),
              ),
            ),
        );
  }
}
