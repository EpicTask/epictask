import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

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
          border: Border.all(color: Colors.grey,width: 4),
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              task.taskDescription,
              style: titleLarge(context)
            ),
            Text('Reward: ${task.rewardAmount} ${task.rewardCurrency}',
              style: titleLarge(context)),
            Text('Due Date: ${formatDate(task.expirationDate)}',
              style: titleLarge(context)),
            Text('Assigned To: ${task.assignedUser}',
              style: titleLarge(context)),
            if (task.markedCompleted)  Text('Marked Completed',
              style: titleLarge(context)),
            Padding(
              padding: const EdgeInsets.only(top:8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () => completeTask(task, task.userId),
                    child:  Text('Completed',style: titleMedium(context),),
                  ),
                  ElevatedButton(
                    onPressed: () => assignTask(task.taskId),
                    child:  Text('Assign',style: titleMedium(context)),
                  ),
                  ElevatedButton(
                    onPressed: () => deleteTask(task.taskId),
                    child:  Text('Delete',style: titleMedium(context)),
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
          border: Border.all(color: Colors.grey,width: 2),
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              task.taskDescription,
              
              style: titleLarge(context),
            ),
            Text('Reward: ${task.rewardAmount} ${task.rewardCurrency}',
              style: titleLarge(context)),
            Text('Due Date: ${formatDate(task.expirationDate)}',
              style: titleLarge(context)),
            Text('Assigned To: ${task.assignedUser}',
              style: titleLarge(context)),
            if (task.markedCompleted)  Text('Marked Completed',
              style: titleLarge(context)),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () => completeTask(task, task.userId),
                  child: Text('Completed',
              style: titleMedium(context)),
                ),
              ],
            ),
            // const UserList(
            //   // showModal: showModal,
            //   // taskId: task.taskId,
            //   // closeModal: () => showModal = false,
            // ),
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

  const UserList(
      {super.key,
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

class TaskModel {
  final String taskDescription;
  final double rewardAmount;
  final String rewardCurrency;
  final DateTime expirationDate;
  final String assignedUser;
  final bool markedCompleted;
  final String userId;
  final String taskId;

  TaskModel({
    required this.taskDescription,
    required this.rewardAmount,
    required this.rewardCurrency,
    required this.expirationDate,
    required this.assignedUser,
    required this.markedCompleted,
    required this.userId,
    required this.taskId
  });

    factory TaskModel.defaultTask() {
    return TaskModel(
      taskDescription: 'Default Task',
      rewardAmount: 100.0,
      rewardCurrency: 'XRP',
      expirationDate: DateTime.now(),
      assignedUser: 'James',
      markedCompleted: false,
      userId: '123456789',
      taskId: '12345',
    );
  }
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
