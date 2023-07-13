import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../root/root_page.dart';



///Go router navigation
final GoRouter router = GoRouter(
  routes: <RouteBase>[
    GoRoute(
      path: '/',
      builder: (BuildContext context, GoRouterState state) {
        return const RootPage();
      },
      routes: const <RouteBase>[
    
      ],
    ),
  ],
);
