import 'package:epictask/models/task_model/task_model.dart';
import 'package:epictask/screens/tasks/components/alert_dialog.dart';
import 'package:epictask/screens/tasks/components/ui_layout.dart';
import 'package:epictask/services/service_config/service_config.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../bloc/generics/generic_bloc.dart';
import '../../models/user_model/user_model.dart';
import '../../repositories/all_users_repository.dart';
import '../../services/functions/test_api.dart';
import '../users/all_users_modal.dart';
import 'components/menu_popup_widget.dart';
import 'logic/logic.dart';

class DetailedTaskScreen extends StatelessWidget {
  const DetailedTaskScreen({super.key, required this.task});
  final TaskModel task;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: Scaffold(
      appBar: AppBar(
        title: Text("Task Details", style: titleMedium(context)),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.more_horiz))
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(32.0),
        child: TaskCardShape(
          child: SizedBox(
              height: SizeConfig.screenHeight,
              width: SizeConfig.screenWidth,
              child: Column(
                children: [
                  HighLevelDataWidget(
                    task: task,
                  ),
                  Container(
                    height: 2,
                    color: Colors.black,
                  ),
                  ButtonBarWidget(task: task),
                  Container(
                    height: 2,
                    color: Colors.black,
                  ),
                  AdditionalDetailsWidget(task: task)
                ],
              )),
        ),
      ),
    ));
  }
}

class HighLevelDataWidget extends StatelessWidget {
  final TaskModel task;

  const HighLevelDataWidget({super.key, required this.task});
  @override
  Widget build(BuildContext context) {
    return Expanded(
        flex: 3,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              task.task_description,
              style: headlineSmall(context)
                  ?.copyWith(color: Colors.black, fontWeight: FontWeight.bold),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: <Widget>[
                Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    DefaultTaskDetailPadding(
                      child: Text(
                        "Assigned To",
                        style: titleLarge(context),
                      ),
                    ),
                    DefaultTaskDetailPadding(
                      child: Text(
                        "Due Date",
                        style: titleLarge(context),
                      ),
                    ),
                    DefaultTaskDetailPadding(
                      child: Text(
                        "Status",
                        style: titleLarge(context),
                      ),
                    ),
                    DefaultTaskDetailPadding(
                      child: Text(
                        "Payment Method",
                        style: titleLarge(context),
                      ),
                    ),
                  ],
                ),
                SizedBox(
                  width: SizeConfig.blockSizeHorizontal * 4,
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    (task.assigned_to_ids?.isNotEmpty ?? false)
                        ? FutureBuilder<String>(
                            future:
                                getUserDisplayName(task.assigned_to_ids!.first),
                            builder: (context, snapshot) {
                              if (snapshot.hasData) {
                                String displayName = snapshot.data as String;
                                return DefaultTaskDetailPadding(
                                  child: Text(displayName,
                                      style: titleLarge(context)),
                                );
                              }
                              return DefaultTaskDetailPadding(
                                  child: Text('Unassigned',
                                      style: titleSmall(context)));
                            },
                          )
                        : DefaultTaskDetailPadding(
                            child:
                                Text('Unassigned', style: titleSmall(context))),
                    DefaultTaskDetailPadding(
                      child: Text(
                        formatDateStandard(DateTime.fromMillisecondsSinceEpoch(
                            task.expiration_date * 1000)),
                        style: titleLarge(context),
                      ),
                    ),
                    (task.marked_completed ?? false)
                        ? DefaultTaskDetailPadding(
                            child: Text(
                              "Completed",
                              style: titleLarge(context),
                            ),
                          )
                        : DefaultTaskDetailPadding(
                            child: Text(
                              "Pending",
                              style: titleLarge(context),
                            ),
                          ),
                    DefaultTaskDetailPadding(
                      child: Column(
                        children: [
                          Text(
                            task.payment_method,
                            style: titleLarge(context),
                          ),
                          if (task.smart_contract_enabled == true)
                            const Text('Escrow is Active')
                        ],
                      ),
                    )
                  ],
                )
              ],
            )
          ],
        ));
  }
}

class ButtonBarWidget extends StatelessWidget {
  final TaskModel task;

  const ButtonBarWidget({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return ButtonBar(
      alignment: MainAxisAlignment.center,
      children: [
        Column(
          children: [
            IconButton(onPressed: () {}, icon: const Icon(Icons.edit)),
            Text(
              'Edit',
              style: titleMedium(context),
            )
          ],
        ),
        (task.terms_id?.isNotEmpty ?? false)
            ? Column(
                children: [
                  IconButton(
                      onPressed: () {
                        viewContractAlertDialog(context, task);
                      },
                      icon: const Icon(Icons.edit_document)),
                  Text(
                    'View Contract',
                    style: titleMedium(context),
                  )
                ],
              )
            : Column(
                children: [
                  IconButton(
                      onPressed: () {
                        generateContract(task);
                        showGeneratingContractSnackBar(context);
                      },
                      icon: const Icon(Icons.edit_document)),
                  Text(
                    'Create Contract',
                    style: titleMedium(context),
                  )
                ],
              ),
        Column(
          children: [
            IconButton(onPressed: () {}, icon: const Icon(Icons.favorite)),
            Text(
              'Likes',
              style: titleMedium(context),
            )
          ],
        ),
        Column(
          children: [
            IconButton(onPressed: () {}, icon: const Icon(Icons.attach_file)),
            Text(
              'Attachments',
              style: titleMedium(context),
            )
          ],
        ),
        Column(
          children: [
            IconButton(
                onPressed: () {
                  if (task.smart_contract_enabled == true) {
                    reassignTaskAlertDialog(context);
                  } else {
                    showModalBottomSheet(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20)),
                      context: context,
                      builder: (BuildContext context) {
                        return BlocProvider<
                                GenericBloc<UserModel, AllUserRepository>>(
                            create: (BuildContext context) =>
                                GenericBloc<UserModel, AllUserRepository>(
                                  repository: AllUserRepository(),
                                ),
                            child: UserModalSheet(
                              task: task,
                            ));
                      },
                    );
                  }
                },
                icon: const Icon(Icons.person_add)),
            Text(
              'Assign',
              style: titleMedium(context),
            )
          ],
        ),
        if(task.terms_id?.isNotEmpty ?? false)
        Column(
          children: [
            IconButton(
                onPressed: () {
                  deleteContract(task.terms_id ?? '', task.task_id);
                  showDeletingContractSnackBar(context);
                },
                icon: const Icon(Icons.delete)),
            Text(
              'Delete Contract',
              style: titleMedium(context),
            )
          ],
        ),
      ],
    );
  }
}

class AdditionalDetailsWidget extends StatelessWidget {
  final TaskModel task;

  const AdditionalDetailsWidget({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return Expanded(
        flex: 3,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DefaultTaskDetailPadding(
              child: Text("Additional Details",
                  style: titleMedium(context)?.copyWith(
                      color: Colors.black, fontWeight: FontWeight.bold)),
            ),
            Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    DefaultTaskDetailPadding(
                      child: Text("Project Name:", style: titleLarge(context)),
                    ),
                    DefaultTaskDetailPadding(
                      child: Text("Project ID:", style: titleLarge(context)),
                    ),
                    DefaultTaskDetailPadding(
                      child: Text("Attachments:", style: titleLarge(context)),
                    ),
                  ],
                ),
                Column(
                  children: [
                    DefaultTaskDetailPadding(
                      child: Text(task.project_name ?? '',
                          style: titleLarge(context)),
                    ),
                    DefaultTaskDetailPadding(
                      child: Text(task.project_id ?? '',
                          style: titleLarge(context)),
                    ),
                  ],
                )
              ],
            ),
            DefaultTaskDetailPadding(
              child: Text('Contract', style: titleLarge(context)),
            ),
            if (task.terms_blob?.isNotEmpty ?? false) Text(task.terms_blob!),
            if (task.terms_id?.isNotEmpty ?? false)
              Expanded(
                child: Text(
                  "Contract Generated",
                  style: titleMedium(context),
                ),
              )
          ],
        ));
  }
}
