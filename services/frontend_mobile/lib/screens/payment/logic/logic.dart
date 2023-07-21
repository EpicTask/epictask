import 'package:cloud_firestore/cloud_firestore.dart';

// Handles XUMM payment signing urls
// ignore: non_constant_identifier_names
Stream<List<String?>> payloadUrl(String task_id) {
  if (task_id.isEmpty) {
    return const Stream<
        List<String?>>.empty(); // Handle case when the task ID is empty
  }

  return FirebaseFirestore.instance
      .collection('test_xrpl_service')
      .where('task_id', isEqualTo: task_id)
      .orderBy('timestamp', descending: true)
      .limit(1)
      .snapshots()
      .map((snapshot) {
    if (snapshot.size > 0) {
      final data = snapshot.docs[0].data();
      String? nextAlways = data['next']['always'] as String?;
      bool pushNotification = data['pushed'] as bool? ?? false;

      if (pushNotification) {
        // Show push notification message, and return null to avoid launching the URL automatically
        return ['Push Notification Sent!', nextAlways];
      } else {
        // Automatically launch the URL
        return ['Push Notification Not Sent!', nextAlways];
      }
    } else {
      return [
        'Document does not exist!',
        ''
      ]; // Handle case when the document doesn't exist
    }
  });
}
