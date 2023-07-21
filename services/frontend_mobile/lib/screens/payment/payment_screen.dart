import 'dart:async';

import 'package:epictask/screens/payment/logic/logic.dart';
import 'package:epictask/screens/users/components/loading_widget.dart';
import 'package:epictask/services/navigation/navigation.dart';
import 'package:epictask/services/service_config/service_config.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key, required this.task_id});

  final String task_id;

  @override
  Widget build(BuildContext context) {
    print(task_id);
    return StreamBuilder<List<String?>>(
      stream: payloadUrl(task_id),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          List<String?> data = snapshot.data!;
          String? dataText = data[0];
          String? url = data[1];
          if (dataText == 'Push Notification Sent!') {
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Text(
                    'Push Notification Sent!',
                    style: headlineLarge(context),
                    textAlign: TextAlign.center,
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    router.go('/'); // Close the screen
                  },
                  child: const Text('Close'),
                ),
                SizedBox(height: SizeConfig.screenHeight * .2),
                ElevatedButton(
                  onPressed: () {
                    // Launch the URL in data['next']['always']
                    if (url != null) {
                      final Uri _url = Uri.parse(url);
                      launchUrl(_url);
                    }
                  },
                  child: const Text("Didn't receive notification?"),
                ),
              ],
            );
          } else {
            // Automatically launch the URL
            final Uri _url = Uri.parse(url!);
            launchUrl(_url);

            return const Loading(); // Return the Loading widget while the URL is launching
          }
        } else if (snapshot.hasError) {
          return const Text('Error fetching URL');
        } else {
          return const Loading();
        }
      },
    );
  }
}
