import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:epictask/models/user_model/user_model.dart';
import 'package:epictask/services/functions/firebase_functions.dart';

// Profile Screen logic
Future<CurrentUserModel> getUserProfile(String? uid) async {
  if (uid?.isNotEmpty ?? false) {
    DocumentSnapshot snapshot =
        await FirebaseFirestore.instance.collection('users').doc(uid).get();
    if (snapshot.exists) {
      return CurrentUserModel.fromJson(snapshot.data() as Map<String, dynamic>);
    }
  }
  return defaultUserModel2;
}

Future<void> updateProfile(String field, dynamic value) async {
  DocumentReference ref =
      FirebaseFirestore.instance.collection('users').doc(currentUserID);
  DocumentSnapshot snapshot = await ref.get();
  if (snapshot.exists) {
    ref.update({
      field: value,
    });
  }
}

Future<bool> checkPublicAddress(String? uid) async {
  if (uid?.isNotEmpty ?? false) {
    DocumentSnapshot snapshot =
        await FirebaseFirestore.instance.collection('users').doc(uid).get();
    if (snapshot.exists) {
      Map<String, dynamic> userData = snapshot.data() as Map<String, dynamic>;
      if (userData.containsKey('publicAddress') && userData['publicAddress'].isNotEmpty) {
        return true;
      }
    }
  }
  return false;
}
