
import 'package:flutter/material.dart';

import '../../../services/navigation/navigation.dart';
import '../../../services/ui/text_styles.dart';

/// Welcome Alert Dialog
Future<dynamic> welcomeAlertDialog(BuildContext context) {
  return showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: const Text(
          "Welcome to Epic Task.",
        ),
        titleTextStyle: headlineSmall(context)?.copyWith(color: Colors.black),
        contentTextStyle: titleLarge(context)?.copyWith(color: Colors.black),
        content: const Text(
          "This is an MVP deployed on the testnet environment."
          " We kindly request that you refrain from using mainnet wallets with this prototype."
          " Please be aware that certain features may not function as expected due to its developmental nature."
          " Please be sure to connect test wallet before creating tasks.",
        ),
        actions: <Widget>[
          TextButton(
            child: const Text('Close'),
            onPressed: () {
              router.pop();
            },
          ),
        ],
      );
    },
  );
}
