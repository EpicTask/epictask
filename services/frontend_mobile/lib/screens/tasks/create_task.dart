import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'logic/bloc.dart';

class CreateTaskWidget extends StatefulWidget {
  const CreateTaskWidget({super.key});

  @override
  State<CreateTaskWidget> createState() => _CreateTaskWidgetState();
}

class _CreateTaskWidgetState extends State<CreateTaskWidget> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController taskTitleController = TextEditingController();

  final TextEditingController taskDescriptionController =
      TextEditingController();

  final TextEditingController projectNameController = TextEditingController();

  final TextEditingController termsBlobController = TextEditingController();

  final TextEditingController rewardAmountController = TextEditingController();

  final bool requiresAttachments = false;

  String paymentMethodType = 'Pay Directly';

  String rewardCurrencyType = 'XRP';

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
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    controller: taskTitleController,
                    decoration: InputDecoration(
                        enabledBorder: const OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.blueAccent)),
                        labelText: 'Task Title',
                        labelStyle: titleLarge(context)),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a task title';
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    controller: taskDescriptionController,
                    decoration: InputDecoration(
                        enabledBorder: const OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.blueAccent)),
                        // border: const OutlineInputBorder(borderSide: BorderSide(color: Colors.blueAccent)),
                        labelText: 'Task Description',
                        labelStyle: titleLarge(context)),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a task description';
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    controller: projectNameController,
                    decoration: InputDecoration(
                        enabledBorder: const OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.blueAccent)),
                        labelText: 'Project Name',
                        labelStyle: titleLarge(context)),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    controller: termsBlobController,
                    decoration: InputDecoration(
                        enabledBorder: const OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.blueAccent)),
                        labelText: 'Conditions',
                        labelStyle: titleLarge(context)),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter conditions';
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    controller: rewardAmountController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                        enabledBorder: const OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.blueAccent)),
                        labelText: 'Reward Amount',
                        labelStyle: titleLarge(context)),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a reward amount';
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: DropdownButton<bool>(
                    value: requiresAttachments,
                    onChanged: (newValue) {
                      setState(() {
                        requiresAttachments == newValue;
                      });
                    },
                    items: const <DropdownMenuItem<bool>>[
                      DropdownMenuItem<bool>(
                        value: true,
                        child: Text('Yes'),
                      ),
                      DropdownMenuItem<bool>(
                        value: false,
                        child: Text('No'),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: DropdownButton<String>(
                    value:
                        paymentMethodType, // Set the value to the selectedValue variable
                    onChanged: (newValue) {
                      setState(() {
                        paymentMethodType =
                            newValue!; // Update the selectedValue variable
                      });
                    },
                    items: const <DropdownMenuItem<String>>[
                      DropdownMenuItem<String>(
                        value: 'Pay Directly',
                        child: Text('Pay Directly'),
                      ),
                      DropdownMenuItem<String>(
                        value: 'Escrow',
                        child: Text('Escrow'),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: DropdownButton<String>(
                    value:
                        rewardCurrencyType, // Set the value to the selectedValue variable
                    onChanged: (newValue) {
                      setState(() {
                        rewardCurrencyType =
                            newValue!; // Update the selectedValue variable
                      });
                    },
                    items: const <DropdownMenuItem<String>>[
                      DropdownMenuItem<String>(
                        value: 'Pay Directly',
                        child: Text('Pay Directly'),
                      ),
                      DropdownMenuItem<String>(
                        value: 'Escrow',
                        child: Text('Escrow'),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      final taskTitle = taskTitleController.text;
                      final taskDescription = taskDescriptionController.text;
                      final projectName = projectNameController.text;
                      final termsBlob = termsBlobController.text;
                      final rewardAmount =
                          double.parse(rewardAmountController.text);
                      final rewardCurrency = rewardCurrencyType;
                      final paymentMethod = paymentMethodType;

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
