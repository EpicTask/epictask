import 'package:cloud_firestore/cloud_firestore.dart';

Future<String> getUserDisplayName(String? uid) async {
  if (uid?.isNotEmpty ?? false) {
    DocumentSnapshot snapshot =
        await FirebaseFirestore.instance.collection('users').doc(uid).get();
    if (snapshot.exists) {
      dynamic data = snapshot.data();
      String? displayName = data['displayName'] as String?;
      return displayName ?? '';
    }
  }
  return '';
}
