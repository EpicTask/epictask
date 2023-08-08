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
import 'components/alert_dialog.dart';
import 'logic/logic.dart';

// UI Cards for Open Tasks and Assigned Tasks
class TaskCard extends StatelessWidget {
  final TaskModel task;

  const TaskCard({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return TaskCardShape(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            CardTitle(task: task),
            CardBody(task: task),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(children: [
                  if (task.auto_verify ?? false)
                    Tooltip(
                      message:
                          'This task will be automatically verified using AI.',
                      child: Text('🤖  ', style: titleLarge(context)),
                    ),
                  if (task.terms_blob?.isNotEmpty ?? false)
                    Text('Conditions:', style: titleLarge(context)),
                ]),
                if (task.terms_id?.isNotEmpty ?? false)
                  Tooltip(
                      message: 'View Contract',
                      child: IconButton(
                          onPressed: () {
                            viewContractAlertDialog(context, task);
                          },
                          icon: const Icon(Icons.description)))
              ],
            ),
            if ((task.terms_id?.isEmpty ?? false) &&
                (task.terms_blob?.isNotEmpty ?? false))
              Tooltip(
                  message: task.terms_blob ?? '',
                  child: Text(
                    task.terms_blob ?? '',
                    style: titleLarge(context),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  )),
          ]),
          
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
                              future:
                                  getUserDisplayName(task.assigned_to_ids!.first),
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

class BodyCard extends StatelessWidget {
  const BodyCard({super.key, required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) {
    return Card(
        color: Colors.blue.shade800,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        elevation: 10,
        child: child);
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
              ],
            ),
          )
        : nil;
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

class TaskCardShape extends StatelessWidget {
  const TaskCardShape({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Card(
        elevation: 10,
        color: Colors.grey[850],
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(padding: const EdgeInsets.all(16.0), child: child),
      ),
    );
  }
}

class TaskCard2 extends StatelessWidget {
  const TaskCard2({
    super.key,
    required this.task,
  });

  final TaskModel task;

  @override
  Widget build(BuildContext context) {
    return TaskCardShape(
        child: Column(
      children: [
        CardTitle(
          task: task,
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
