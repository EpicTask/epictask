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
const String googleLogo = 'assets/images/google_logo.png';
const String epicTaskLogo = 'assets/images/180.png';

const String successAlert =
    'Password has been reset successfully. Please check your email for further instructions.';
const String failureAlert = 'Email not found. Please enter a valid email.';
const String xummSignIn = 'https://xrpl-5wpxgn35iq-uc.a.run.app/xummSignInRequest';
const String displayNameDiaglog = 'Update Display Name';
const String publicAddressDiaglog = 'Update Public Address';
