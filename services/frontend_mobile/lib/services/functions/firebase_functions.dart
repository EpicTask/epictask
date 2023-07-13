import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:epictask/models/task_event_model/task_event.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../models/user_event_model/user_event.dart';
final String currentUserID = FirebaseAuth.instance.currentUser!.uid;
class FirestoreDatabase {
  // Collection References
  CollectionReference<Object?> userEventsCollection =
      FirebaseFirestore.instance.collection('test_user_events');
  CollectionReference<Object?> taskEventsCollection =
      FirebaseFirestore.instance.collection('test_task_events');

  Future<void> writeUserEvent(UserEvent userEvent) async {
    final DocumentReference ref = userEventsCollection.doc();
    await ref.set(userEvent.toJson());
    await ref.update(<String, dynamic>{
        'timestamp': FieldValue.serverTimestamp(),
      });
  }

  Future<void> writeTaskEvent(TaskEvent taskEvent) async {
        final DocumentReference ref = taskEventsCollection.doc();
    await ref.set(taskEvent.toJson());
    await ref.update(<String, dynamic>{
        'timestamp': FieldValue.serverTimestamp(),
        'event_id':ref.id,
      });
  }
}
