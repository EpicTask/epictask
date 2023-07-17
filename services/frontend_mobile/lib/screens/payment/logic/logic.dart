import 'package:cloud_firestore/cloud_firestore.dart';

Stream<String?> payloadUrl(String task_id) {
  DocumentReference ref =
      FirebaseFirestore.instance.collection('test_xrpl_service').doc(task_id);
  if (task_id.isNotEmpty) {
    return ref.get().then((snapshot) {
      if (snapshot.exists) {
        dynamic data = snapshot.data();
        return data['payloadUrl'] as String;
      } else {
        return null; // Handle case when the document doesn't exist
      }
    }).asStream();
  }
  return const Stream.empty(); // Handle case when the task ID is empty
}
