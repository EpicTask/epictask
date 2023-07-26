import 'package:epictask/models/contract_model/contract_model.dart';
import 'package:epictask/models/task_model/task_model.dart';
import 'package:epictask/screens/tasks/logic/logic.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';

import '../../../services/navigation/navigation.dart';

// Alert dialogs for Login Screen
Future<dynamic> viewContractAlertDialog(BuildContext context, TaskModel task) {
  return showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text(
          task.task_description,
        ),
        titleTextStyle: headlineSmall(context)?.copyWith(color: Colors.black),
        contentTextStyle: titleLarge(context)?.copyWith(color: Colors.black),
        content: FutureBuilder<Object>(
            future: getContract(task.terms_id),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                ContractModel contract = snapshot.data as ContractModel;
                return SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Row(
                        children: [
                          const Text('Date Generated: '),
                          Text(formatDateStandard(contract.timestamp!))
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        contract.contract ?? 'No contract was found.',
                     
                      ),
                    ],
                  ),
                );
              } else {
                return const Text('No contract was found',
                    );
              }
            }),
        actions: <Widget>[
          TextButton(
            child: const Text('Close'),
            onPressed: () {
              router.pop();
            },
          ),
          // ElevatedButton(
          //   child: const Text('Close'),
          //   onPressed: () async {
            
          //   },
          // ),
        ],
      );
    },
  );
}
