// import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/bloc_observer/custom_bloc_observer.dart';

Future<String> projectInitializer() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: const FirebaseOptions(
            apiKey: "AIzaSyATAJ0EJtaAsMeTzB17MQpJJuoT4gYnchY",
            authDomain: "task-coin-384722.firebaseapp.com",
            projectId: "task-coin-384722",
            storageBucket: "task-coin-384722.appspot.com",
            messagingSenderId: "672847978942",
            appId: "1:672847978942:web:e797e3882c63201e8799ef",
            measurementId: "G-CJH3SG2YTS"));
  } else {
    await Firebase.initializeApp();
  }
  // FirebaseFunctions.instance.useFunctionsEmulator('localhost', 5001);
  Bloc.observer = CustomBlocObserver();

  // Enable Crashlytics in release mode only
  if (!kIsWeb) {
    if (kDebugMode) {
      await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(false);
    } else {
      await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
      FlutterError.onError = (FlutterErrorDetails errorDetails) {
        // If you wish to record a "non-fatal" exception, please use `FirebaseCrashlytics.instance.recordFlutterError` instead
        FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
      };
    }
  }

  // Pass all uncaught asynchronous errors that aren't handled by the Flutter framework to Crashlytics
  PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    if (!kIsWeb) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    }
    return true;
  };
  // }

  return 'initialized';
}
