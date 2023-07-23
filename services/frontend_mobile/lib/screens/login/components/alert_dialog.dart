import 'package:flutter/material.dart';

import '../../../repositories/user_repository.dart';
import '../../../services/constants.dart';
import '../../../services/navigation/navigation.dart';

// Alert dialogs for Login Screen
Future<dynamic> resetPasswordAlertDialog(BuildContext context) {
  final TextEditingController emailController = TextEditingController();
  final GlobalKey<FormState> formKey = GlobalKey<FormState>();
  return showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: const Text('Reset Password'),
        content: Form(
          key: formKey,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              const Text(
                  'Enter your email address to receive a password reset link'),
              const SizedBox(height: 16),
              TextFormField(
                controller: emailController,
                decoration: const InputDecoration(
                  hintText: 'Email',
                  border: OutlineInputBorder(),
                ),
                validator: (String? value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  // if (!validateEmail(value)) {
                  //   return 'Please enter a valid email address';
                  // }
                  return null;
                },
                keyboardType: TextInputType.emailAddress,
              ),
            ],
          ),
        ),
        actions: <Widget>[
          TextButton(
            child: const Text('Cancel'),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
          ElevatedButton(
            child: const Text('Reset Password'),
            onPressed: () async {
              final FormState? form = formKey.currentState;
              if (form!.validate()) {
                form.save();
                final bool result = await UserRepository()
                    .isRegistered(emailController.value.text);
                ScaffoldMessenger.of(context)
                  ..removeCurrentSnackBar()
                  ..showSnackBar(
                    SnackBar(
                      content: result
                          ? const Text(successAlert)
                          : const Text(failureAlert),
                      backgroundColor: Colors.grey,
                    ),
                  );
                router.pop();
              }
            },
          ),
        ],
      );
    },
  );
}
