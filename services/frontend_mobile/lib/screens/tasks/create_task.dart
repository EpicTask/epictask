import 'package:epictask/models/task_model/task_model.dart';
import 'package:epictask/screens/tasks/components/calendar_widget.dart';
import 'package:epictask/screens/tasks/logic/logic.dart';
import 'package:epictask/services/functions/firebase_functions.dart';
import 'package:epictask/services/navigation/navigation.dart';
import 'package:epictask/services/service_config/service_config.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'logic/bloc.dart';

// Create Task Widget
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

  late ValueNotifier<DateTime> expiratationDate;

  bool requiresAttachments = false;

  String paymentMethodType = 'Pay Directly';

  String rewardCurrencyType = 'XRP';

  bool autoVerify = false;

  @override
  void initState() {
    expiratationDate =
        ValueNotifier<DateTime>(DateTime.now().add(const Duration(days: 7)));
    super.initState();
  }

  @override
  void dispose() {
    expiratationDate.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider<TaskFormBloc>(
      create: (context) => TaskFormBloc(),
      child: BlocConsumer<TaskFormBloc, TaskFormState>(
        listener: (context, state) {
          if (state is TaskFormSubmittedSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Task successfully created.',
                    style: titleMedium(context)),
              ),
            );
            taskDescriptionController.clear();
            taskTitleController.clear();
            termsBlobController.clear();
            rewardAmountController.clear();
            projectNameController.clear();
          } else if (state is TaskFormSubmittedFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Task submission failed: ${state.error}',
                    style: titleMedium(context)),
              ),
            );
            if (kDebugMode) {
              print(state.error);
            }
          }
        },
        builder: (context, state) {
          final bloc = BlocProvider.of<TaskFormBloc>(context);

          return SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
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
                    controller: rewardAmountController,
                    label: 'Reward Amount',
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a reward amount';
                      }
                      return null;
                    },
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 24.0, right: 24.0),
                    child: CalendarWidget(expiratationDate: expiratationDate),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
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
                      SizedBox(
                        height: SizeConfig.blockSizeHorizontal,
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
                  Padding(
                    padding: const EdgeInsets.only(
                        top: 16.0, left: 24.0, bottom: 16.0),
                    child: Text(
                      'Optional',
                      style: titleLarge(context),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Container(
                      color: Colors.white,
                      height: 2,
                    ),
                  ),
                  buildFormField(
                    controller: termsBlobController,
                    label: 'Conditions',
                    // validator: (value) {
                    //   if (value == null || value.isEmpty) {
                    //     return 'Please enter conditions';
                    //   }
                    //   return null;
                    // },
                  ),
                  buildFormField(
                      controller: projectNameController,
                      label: 'Project Name',
                      rule: TextCapitalization.words),
                  buildFormField(
                      controller: taskTitleController,
                      label: 'Task Title',
                      rule: TextCapitalization.words
                      // validator: (value) {
                      //   if (value == null || value.isEmpty) {
                      //     return 'Please enter a task title';
                      //   }
                      //   return null;
                      // },
                      ),
                  Padding(
                    padding: const EdgeInsets.only(
                        left: 24.0, top: 16.0, right: 24.0, bottom: 16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Auto Verify:',
                          style: titleLarge(context),
                        ),
                        Switch(
                            value: autoVerify,
                            onChanged: (value) {
                              setState(() {
                                autoVerify = false;
                              });
                            })
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(
                        left: 24.0, top: 16.0, right: 24.0, bottom: 16.0),
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
                  SizedBox(
                    height: SizeConfig.blockSizeHorizontal,
                  ),
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Center(
                      child: ElevatedButton(
                        onPressed: () {
                          if (_formKey.currentState!.validate()) {
                            int timestamp =
                                timestampToSeconds(expiratationDate.value);
                            final task = TaskModel.defaultTask().copyWith(
                                assigned_to_ids: [],
                                auto_verify: autoVerify,
                                expiration_date: timestamp,
                                task_description:
                                    taskDescriptionController.text,
                                project_name: projectNameController.text,
                                terms_blob: termsBlobController.text,
                                reward_amount:
                                    double.parse(rewardAmountController.text),
                                reward_currency: rewardCurrencyType,
                                payment_method: paymentMethodType,
                                user_id: currentUserID);

                            final event = TaskFormSubmitted(task: task);
                            bloc.add(event);
                            router.pop();
                          }
                        },
                        child: Text('Submit', style: titleLarge(context)),
                      ),
                    ),
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
      padding: const EdgeInsets.all(24.0),
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

  Padding buildDropdownButton<T>({
    required T value,
    required void Function(T?) onChanged,
    required List<DropdownMenuItem<T>> items,
  }) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: DropdownButton<T>(
        value: value,
        onChanged: onChanged,
        items: items,
        style: titleLarge(context),
      ),
    );
  }
}
