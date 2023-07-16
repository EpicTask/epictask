import 'package:epictask/screens/payment/logic/logic.dart';
import 'package:epictask/screens/users/components/loading_widget.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key, required this.task_id});

  final String task_id;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<String?>(
      stream: payloadUrl(task_id),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.active &&
            snapshot.hasData) {
          String url = snapshot.data!;
          final Uri? _url = Uri.tryParse(url);
          if (_url != null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              launchUrl(_url);
            });
            return const SizedBox(); // Return an empty SizedBox while the URL is launching
          } else {
            return const Text('Invalid URL');
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
