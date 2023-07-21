import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CustomBlocObserver extends BlocObserver {


  @override
  void onChange(BlocBase<dynamic> bloc, Change change) {
    super.onChange(bloc, change);
    if (kDebugMode) {
      // print('onChange -- ${bloc.runtimeType}, $change');
    }
  }

  @override
  void onError(BlocBase<dynamic> bloc, Object error, StackTrace stackTrace) {
    if (kDebugMode) {
      print('onError -- ${bloc.runtimeType}, $error');
    }
    // Log to gcp
    super.onError(bloc, error, stackTrace);
  }

  @override
  void onClose(BlocBase<dynamic> bloc) {
    super.onClose(bloc);
    if (kDebugMode) {
      // print('onClose -- ${bloc.runtimeType}');
    }
  }
}
