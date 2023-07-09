import 'package:flutter/material.dart';



List<String> bottomNavItems = <String>[
  'Home',
  'Services',
  'Database',
  'Settings'
];

List<Icon> bottomNavIcons = const <Icon>[
  Icon(Icons.home),
  Icon(Icons.search),
  Icon(Icons.storage),
  Icon(Icons.settings)
];

const String signInWithGoogle = ' Sign in with Google';
const String signInWithApple = '  Apple';
const String google_logo = 'assets/images/google_logo.png';
const String profileImage = 'assets/images/profile.png';
const String cloudLogo = 'assets/images/logo.png';

const String successAlert =
    'Password has been reset successfully. Please check your email for further instructions.';
const String failureAlert = 'Email not found. Please enter a valid email.';
