import 'package:epictask/models/task_model/task_model.dart';
import 'package:epictask/screens/payment/payment_screen.dart';
import 'package:epictask/screens/profile/profile.dart';
import 'package:epictask/screens/signup/signup_screen.dart';
import 'package:epictask/screens/tasks/detailed_task_screen.dart';
import 'package:epictask/screens/users/components/loading_widget.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../root/root_page.dart';

///Go router navigation
final GoRouter router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (BuildContext context, GoRouterState state) {
        return const RootPage();
      },
      routes: [
        GoRoute(
          name: 'loading',
          path: 'loading',
          builder: (BuildContext context, GoRouterState state) {
            return const Loading();
          },
        ),
        GoRoute(
          name: 'profile',
          path: 'profile',
          builder: (BuildContext context, GoRouterState state) {
            return const ProfilePage();
          },
        ),
        GoRoute(
          name: 'payment',
          path: 'payment',
          builder: (BuildContext context, GoRouterState state) {
            // ignore: non_constant_identifier_names
            String task_id = state.extra as String;
            return PaymentScreen(
              task_id: task_id,
            );
          },
        ),
        GoRoute(
          name: 'signup',
          path: 'signup',
          builder: (BuildContext context, GoRouterState state) {
            return const SignupScreen();
          },
        ),
        GoRoute(
          name: 'taskDetail',
          path: 'taskDetail/:task_id', // Define a dynamic parameter
          builder: (BuildContext context, GoRouterState state) {
            if (state.extra == null) {
              router.go('/');
              return Container();
            } else {
              TaskModel task = state.extra as TaskModel;
              return DetailedTaskScreen(task: task);
            }
          },
        ),
      ],
    ),
  ],
);
