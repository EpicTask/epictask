import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'bloc/authentication_bloc/authentication_bloc.dart';
import 'repositories/user_repository.dart';
import 'services/navigation/navigation.dart';
import 'services/project_initializer.dart';
import 'services/ui/responsive.dart';
import 'services/ui/theme.dart';

void main() async {
  await projectInitializer();
  final UserRepository userRepository = UserRepository();
  runApp(BlocProvider<AuthenticationBloc>(
    create: (_) => AuthenticationBloc(userRepository: userRepository),
    child: const MyApp(),
  ));
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      builder: (_, widget) => responsiveWrapperBuilder(context, widget!),
      theme: themeDataBuilderDark(),
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
