import 'dart:async';

import 'package:epictask/models/task_model/task_model.dart';
import 'package:epictask/services/functions/test_api.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../bloc/generics/generic_bloc.dart';
import '../../../models/user_model/user_model.dart';
import '../../../repositories/all_users_repository.dart';
import '../../../services/navigation/navigation.dart';
import '../../users/all_users_modal.dart';
import '../logic/logic.dart';
import 'alert_dialog.dart';

class PopupMenuButtonWidget extends StatelessWidget {
  const PopupMenuButtonWidget({
    Key? key,
    required this.task,
  }) : super(key: key);

  final TaskModel task;
  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: const Icon(
        Icons.more_vert,
      ),
      onSelected: (String value) {
        switch (value) {
          case 'Pay':
            {
              completeTaskAndInitiatePayment(task);
              Timer(const Duration(seconds: 3), () {
                router.goNamed('payment', extra: task.task_id);
              });
              router.goNamed('loading');
            }
            break;
          case 'Assign':
            {
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
            }
            break;
          case 'View':
            {
              router.goNamed('taskDetail',
                  pathParameters: {'task_id': task.task_id}, extra: task);
            }
            break;
          case 'Delete':
            {
              if (task.smart_contract_enabled == true) {
                deleteTaskAlertDialog(context, task.task_id);
              } else {
                deleteTask(task.task_id);
              }
            }
            break;
          case 'Edit':
            {}
            break;
          case 'Generate Contract':
            {
              generateContract(task);
              showGeneratingContractSnackBar(context);
            }
            break;
          case 'Delete Contract':
            {
              deleteContract(task.terms_id ?? '', task.task_id);
              showDeletingContractSnackBar(context);
            }
            break;
          case 'Add to Calendar':
            {}
            break;
          default:
            {}
            break;
        }
      },
      padding: EdgeInsets.zero,
      itemBuilder: (BuildContext context) => <PopupMenuItem<String>>[
        PopupMenuItem<String>(
          value: 'Pay',
          child: ListTile(
            leading: const Icon(Icons.monetization_on),
            title: Text(
              'Pay',
              style: titleMedium(context)?.copyWith(color: Colors.black),
            ),
          ),
        ),
        PopupMenuItem<String>(
          value: 'Assign',
          child: ListTile(
            leading: const Icon(Icons.person),
            title: Text(
              'Assign',
              style: titleMedium(context)?.copyWith(color: Colors.black),
            ),
          ),
        ),
        PopupMenuItem<String>(
          value: 'View',
          child: ListTile(
            leading: const Icon(Icons.edit),
            title: Text(
              'View',
              style: titleMedium(context)?.copyWith(color: Colors.black),
            ),
          ),
        ),
        (task.terms_id?.isEmpty ?? false)
            ? PopupMenuItem<String>(
                value: 'Generate Contract',
                child: ListTile(
                  leading: const Icon(Icons.description),
                  title: Text(
                    'Generate Contract',
                    style: titleMedium(context)?.copyWith(color: Colors.black),
                  ),
                ),
              )
            : PopupMenuItem<String>(
                value: 'Delete Contract',
                child: ListTile(
                  leading: const Icon(Icons.description),
                  title: Text(
                    'Delete Contract',
                    style: titleMedium(context)?.copyWith(color: Colors.black),
                  ),
                ),
              ),
        // PopupMenuItem<String>(
        //   value: 'Add to Calendar',
        //   child: ListTile(
        //     leading: const Icon(Icons.calendar_month),
        //     title: Text(
        //       'Add to Calendar',
        //       style: titleMedium(context)?.copyWith(color: Colors.black),
        //     ),
        //   ),
        // ),
        PopupMenuItem<String>(
          value: 'Delete',
          child: ListTile(
            leading: const Icon(Icons.exit_to_app),
            title: Text(
              'Delete',
              style: titleMedium(context)?.copyWith(color: Colors.black),
            ),
          ),
        ),
      ],
    );
  }
}

void showGeneratingContractSnackBar(BuildContext context) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          Text('Generating new contract...'),
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
          )
        ],
      ),
      backgroundColor: Colors.blueGrey[200],
      duration: const Duration(seconds: 3),
    ),
  );
}

void showDeletingContractSnackBar(BuildContext context) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          Text('Deleting contract...'),
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
          )
        ],
      ),
      backgroundColor: Colors.blueGrey[200],
    ),
  );
}
