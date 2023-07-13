import 'package:epictask/models/task_model/task_model.dart';
import 'package:epictask/services/functions/firebase_functions.dart';
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

  bool requiresAttachments = false;

  String paymentMethodType = 'Pay Directly';

  String rewardCurrencyType = 'XRP';

  @override
  Widget build(BuildContext context) {
    return BlocProvider<TaskFormBloc>(
      create: (context) => TaskFormBloc(),
      child: BlocConsumer<TaskFormBloc, TaskFormState>(
        listener: (context, state) {
          if (state is TaskFormSubmittedSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Form submitted successfully', style: titleMedium(context)),
              ),
            );
          } else if (state is TaskFormSubmittedFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Form submission failed: ${state.error}', style: titleMedium(context)),
              ),
            );
          }
        },
        builder: (context, state) {
          final bloc = BlocProvider.of<TaskFormBloc>(context);

          return SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  buildFormField(
                    controller: taskTitleController,
                    label: 'Task Title',
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a task title';
                      }
                      return null;
                    },
                  ),
                  buildFormField(
                    controller: taskDescriptionController,
                    label: 'Task Description',
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a task description';
                      }
                      return null;
                    },
                  ),
                  buildFormField(
                    controller: projectNameController,
                    label: 'Project Name',
                  ),
                  buildFormField(
                    controller: termsBlobController,
                    label: 'Conditions',
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter conditions';
                      }
                      return null;
                    },
                  ),
                  buildFormField(
                    controller: rewardAmountController,
                    label: 'Reward Amount',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a reward amount';
                      }
                      return null;
                    },
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Require Attachments:',
                          style: titleLarge(context),
                        ),
                        DropdownButton<bool>(
                          value: requiresAttachments,
                          style: titleLarge(context),
                          onChanged: (newValue) {
                            setState(() {
                              requiresAttachments = newValue!;
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
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        buildDropdownButton<String>(
                          value: paymentMethodType,
                          onChanged: (newValue) {
                            setState(() {
                              paymentMethodType = newValue!;
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
                        buildDropdownButton<String>(
                          value: rewardCurrencyType,
                          onChanged: (newValue) {
                            setState(() {
                              rewardCurrencyType = newValue!;
                            });
                          },
                          items: const <DropdownMenuItem<String>>[
                            DropdownMenuItem<String>(
                              value: 'XRP',
                              child: Text('XRP'),
                            ),
                            DropdownMenuItem<String>(
                              value: 'eTask',
                              child: Text('eTask'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        final task = TaskModel.defaultTask().copyWith(
                          task_description: taskDescriptionController.text,
                          project_name: projectNameController.text,
                          terms_blob: termsBlobController.text,
                          reward_amount: double.parse(rewardAmountController.text),
                          reward_currency: rewardCurrencyType,
                          payment_method: paymentMethodType,
                          user_id: currentUserID
                        );
          
                        final event = TaskFormSubmitted(task: task);
                        bloc.add(event);
                      }
                    },
                    child: Text('Submit', style: titleLarge(context)),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget buildFormField({
    required TextEditingController controller,
    required String label,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
    TextCapitalization? rule,
  }) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: TextFormField(
        controller: controller,
        textCapitalization: rule ?? TextCapitalization.sentences,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          enabledBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.blueAccent),
          ),
          labelText: label,
          labelStyle: titleLarge(context),
        ),
        validator: validator,
      ),
    );
  }

  DropdownButton<T> buildDropdownButton<T>({
    required T value,
    required void Function(T?) onChanged,
    required List<DropdownMenuItem<T>> items,
  }) {
    return DropdownButton<T>(
      value: value,
      onChanged: onChanged,
      items: items,
      style: titleLarge(context),
    );
  }
}