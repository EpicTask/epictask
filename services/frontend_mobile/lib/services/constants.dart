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
const String xrpLogoSvg = 'assets/images/xrp-xrp-logo.svg';
const String xrpLogo = 'assets/images/xrp-xrp-logo.png';

// Dialog messages
const String successAlert =
    'Password has been reset successfully. Please check your email for further instructions.';
const String failureAlert = 'Email not found. Please enter a valid email.';
const String displayNameDiaglog = 'Update Display Name';
const String publicAddressDiaglog = 'Update Public Address';
const String agreementMessage =
    "By pressing Signup you are agreeing to our Term's of Service and Privacy Policy.";

// Urls
const String urlToPrivacyPolicy = 'https://epictask.app/';
const String urlToTerms = 'https://epictask.app/';
const String xummSignIn =
    'https://xrpl-api-us-8l3obb9a.uc.gateway.dev/xummSignInRequest';
const String taskManagementGatewayUrl =
    'https://task-management-api-us-8l3obb9a.uc.gateway.dev';
const String userManagementGatewayUrl =
    'https://user-management-api-us-8l3obb9a.uc.gateway.dev';
