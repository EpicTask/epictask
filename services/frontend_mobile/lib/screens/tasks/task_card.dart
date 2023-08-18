import 'dart:async';

import 'package:epictask/screens/tasks/components/menu_popup_widget.dart';
import 'package:epictask/services/constants.dart';
import 'package:epictask/services/navigation/navigation.dart';
import 'package:epictask/services/service_config/service_config.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:nil/nil.dart';
import 'package:responsive_framework/responsive_breakpoints.dart';

import '../../models/task_model/task_model.dart';
import '../users/all_users_modal.dart';
import 'components/ui_layout.dart';
import 'logic/logic.dart';

// UI Cards for Open Tasks
class TaskCardWeb extends StatelessWidget {
  const TaskCardWeb({
    super.key,
    required this.task,
  });

  final TaskModel task;

  @override
  Widget build(BuildContext context) {
    return TaskCardShape(
        child: Column(
      children: [
        GestureDetector(
          onTap: () => router.goNamed('taskDetail', pathParameters: {'task_id': task.task_id},extra: task),
          child: CardTitle(
            task: task,
          ),
        ),
        Expanded(
            flex: 2,
            child: CardBody(
              task: task,
            )),
        CardButtons(
          task: task,
        ),
      ],
    ));
  }
}

class TaskCard extends StatelessWidget {
  final TaskModel task;

  const TaskCard({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return TaskCardShape(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CardTitle(task: task),
          CardBody(task: task),
        ],
      ),
    );
  }
}

class CardBody extends StatelessWidget {
  const CardBody({
    super.key,
    required this.task,
  });

  final TaskModel task;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: BodyCard(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Amount',
                    style: titleSmall(context),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 8.0, bottom: 8.0),
                    child: Text(task.reward_amount.toStringAsFixed(2),
                        style: headlineSmall(context)),
                  ),
                  SvgPicture.asset(xrpLogoSvg,
                      width: SizeConfig.screenWidth * .05),
                ],
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: IntrinsicWidth(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: BodyCard(
                      child: (task.assigned_to_ids?.isNotEmpty ?? false)
                          ? FutureBuilder<String>(
                              future: getUserDisplayName(
                                  task.assigned_to_ids!.first),
                              builder: (context, snapshot) {
                                if (snapshot.hasData) {
                                  String displayName = snapshot.data as String;
                                  return Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text('Assigned',
                                          style: titleSmall(context)),
                                      const Icon(Icons.person),
                                      Text(displayName,
                                          style: titleLarge(context)),
                                    ],
                                  );
                                }
                                return Text('Assigned To: Unknown User',
                                    style: titleSmall(context));
                              },
                            )
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text('Unassigned', style: titleSmall(context)),
                                const Tooltip(
                                    message: 'Pending assignment.',
                                    child: Icon(Icons.person_off)),
                              ],
                            ),
                    ),
                  ),
                  Expanded(
                    child: BodyCard(
                      child: (task.marked_completed ?? false)
                          ? Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text('Status', style: titleSmall(context)),
                                const Icon(Icons.check),
                              ],
                            )
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text('Status', style: titleSmall(context)),
                                const Tooltip(
                                    message: 'Pending completion.',
                                    child: Icon(Icons.pending)),
                              ],
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CardTitle extends StatelessWidget {
  const CardTitle({
    super.key,
    required this.task,
  });

  final TaskModel task;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: ListTile(
            title: Text(task.task_description, style: headlineSmall(context)),
            subtitle: Text(
              'Due: ${formatDate(DateTime.fromMillisecondsSinceEpoch(task.expiration_date * 1000))}',
              style: titleMedium(context),
            ),
          ),
        ),
        PopupMenuButtonWidget(task: task)
      ],
    );
  }
}

class CardButtons extends StatelessWidget {
  const CardButtons({
    super.key,
    required this.task,
  });

  final TaskModel task;

  @override
  Widget build(BuildContext context) {
    return (!ResponsiveBreakpoints.of(context).equals(TABLET))
        ? Padding(
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
                    onPressed: () => router.goNamed('taskDetail', pathParameters: {'task_id': task.task_id},extra: task),
                    child: Text(
                      'View',
                      style: titleMedium(context),
                    ))
              ],
            ),
          )
        : nil;
  }
}
