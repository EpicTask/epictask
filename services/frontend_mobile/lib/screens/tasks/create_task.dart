import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'logic/bloc.dart';

class CreateTaskWidget extends StatelessWidget {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController taskTitleController = TextEditingController();
  final TextEditingController taskDescriptionController =
      TextEditingController();
  final TextEditingController projectNameController = TextEditingController();
  final TextEditingController termsBlobController = TextEditingController();
  final TextEditingController rewardAmountController = TextEditingController();

  CreateTaskWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider<TaskFormBloc>(
      create: (context) => TaskFormBloc(),
      child: BlocConsumer<TaskFormBloc, TaskFormState>(
        listener: (context, state) {
          if (state is TaskFormSubmittedSuccess) {
            // Form submitted successfully, perform any necessary action
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text('Form submitted successfully',
                      style: titleMedium(context))),
            );
          } else if (state is TaskFormSubmittedFailure) {
            // Form submission failed, display an error message
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text('Form submission failed: ${state.error}',
                      style: titleMedium(context))),
            );
          }
        },
        builder: (context, state) {
          final bloc = BlocProvider.of<TaskFormBloc>(context);

          return Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: taskTitleController,
                  decoration: InputDecoration(
                      labelText: 'Task Title', labelStyle: titleLarge(context)),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a task title';
                    }
                    return null;
                  },
                ),
                TextFormField(
                  controller: taskDescriptionController,
                  decoration: InputDecoration(
                      labelText: 'Task Description',
                      labelStyle: titleLarge(context)),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a task description';
                    }
                    return null;
                  },
                ),
                TextFormField(
                  controller: projectNameController,
                  decoration: InputDecoration(
                      labelText: 'Project Name',
                      labelStyle: titleLarge(context)),
                ),
                Row(
                  children: [
                    Checkbox(
                      value: false,
                      onChanged: (value) {
                        // Handle checkbox state
                      },
                    ),
                    Text(
                      'Requires Attachments',
                      style: titleLarge(context),
                    ),
                  ],
                ),
                TextFormField(
                  controller: termsBlobController,
                  decoration: InputDecoration(
                      labelText: 'Conditions', labelStyle: titleLarge(context)),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter conditions';
                    }
                    return null;
                  },
                ),
                TextFormField(
                  controller: rewardAmountController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                      labelText: 'Reward Amount',
                      labelStyle: titleLarge(context)),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a reward amount';
                    }
                    return null;
                  },
                ),
                ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      final taskTitle = taskTitleController.text;
                      final taskDescription = taskDescriptionController.text;
                      final projectName = projectNameController.text;
                      final requiresAttachments = false;
                      final termsBlob = termsBlobController.text;
                      final rewardAmount =
                          double.parse(rewardAmountController.text);
                      final rewardCurrency = 'XRP';
                      final paymentMethod = '';

                      final event = TaskFormSubmitted(
                        taskTitle: taskTitle,
                        taskDescription: taskDescription,
                        projectName: projectName,
                        requiresAttachments: requiresAttachments,
                        termsBlob: termsBlob,
                        rewardAmount: rewardAmount,
                        rewardCurrency: rewardCurrency,
                        paymentMethod: paymentMethod,
                      );

                      bloc.add(event);
                    }
                  },
                  child: Text('Submit', style: titleLarge(context)),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
