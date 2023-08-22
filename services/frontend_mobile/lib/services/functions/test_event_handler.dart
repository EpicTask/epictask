// ignore_for_file: constant_identifier_names

import 'package:epictask/models/task_event_model/task_event.dart';
import 'package:epictask/services/constants.dart';
import 'package:epictask/services/functions/test_api.dart';
import 'package:flutter/foundation.dart';

import '../../models/user_event_model/user_event.dart';

// Test. API Gateway will be used.
String? taskEventHandler(TaskEvent event) {
  String eventType = event.event_type;

  try {
    switch (eventType) {
      case 'TaskCreated':
        handleTaskCalls(TASKCREATED, event);
        break;
      case 'TaskAssigned':
        handleTaskCalls(TASKASSIGNED, event);
        break;
      case 'TaskUpdated':
        handleTaskCalls(TASKUPDATED, event);
        break;
      case 'TaskCompleted':
        handleTaskCalls(TASKCOMPLETED, event);
        break;
      case 'TaskCancelled':
        handleTaskCalls(TASKCANCELLED, event);
        break;
      case 'TaskCommentAdded':
        handleTaskCalls(TASKCOMMENTADDED, event);
        break;
      case 'TaskExpired':
        handleTaskCalls(TASKEXPIRED, event);
        break;
      case 'TaskRewarded':
        handleTaskCalls(TASKREWARDED, event);
        break;
      case 'TaskRatingUpdated':
        handleTaskCalls(TASKRATINGUPDATE, event);
        break;
      case 'TaskVerified':
        handleTaskCalls(TASKVERIFIED, event);
        break;
      case 'RecommendationGenerated':
        handleTaskCalls('REC', event);
        break;
      default:
        if (kDebugMode) {
          print(
            'Unknown event type: $eventType',
          );
        }
        break;
    }
    return 'Event handled.';
  } catch (error) {
    if (kDebugMode) {
      print(
        'Message publishing error: $error',
      );
    }
    // Handle the error during message publishing
  }
  return null;
}

String? userEventHandler(UserEvent event) {
  String eventType = event.event_type;

  try {
    switch (eventType) {
      case 'UserRegistered':
        handleUserCalls(USERREGISTERED, event);
        break;
      case 'UserSignIn':
        handleUserCalls(USERSIGNIN, event);
        break;
      case 'UserWalletConnected':
        handleUserCalls(USERWALLETCONNECTED, event);
        break;
      case 'UserForgotPassword':
        handleUserCalls(USERFORGOTPASSWORD, event);
        break;
      case 'UserAuthentication':
        handleUserCalls(USERAUTHENTICATION, event);
        break;
      case 'UserProfileUpdate':
        handleUserCalls(USERPROFILEUPDATE, event);
        break;
      case 'UserAccountDeletion':
        handleUserCalls(USERACCOUNTDELETION, event);
        break;
      case 'UserInteraction':
        handleUserCalls(USERINTERACTION, event);
        break;
      case 'UserVerified':
        handleUserCalls(USERVERIFIED, event);
        break;
      default:
        if (kDebugMode) {
          print('Unknown event type: $eventType');
        }
        break;
    }
    return 'Event handled.';
  } catch (error) {
    if (kDebugMode) {
      print('Message publishing error: $error');
    }
    // Handle the error during message publishing
  }
  return null;
}

const String TASKCALL = '$taskManagementGatewayUrl/';
const String TASKCREATED = '$taskManagementGatewayUrl/TaskCreated';
const String TASKASSIGNED = '$taskManagementGatewayUrl/TaskAssigned';
const String TASKUPDATED = '$taskManagementGatewayUrl/TaskUpdated';
const String TASKCOMPLETED = '$taskManagementGatewayUrl/TaskCompleted';
const String TASKCANCELLED = '$taskManagementGatewayUrl/TaskCancelled';
const String TASKEXPIRED = '$taskManagementGatewayUrl/TaskExpired';
const String TASKREWARDED = '$taskManagementGatewayUrl/TaskRewarded';
const String TASKRATINGUPDATE = '$taskManagementGatewayUrl/TaskRatingUpdate';
const String TASKCOMMENTADDED = '$taskManagementGatewayUrl/TaskCommentAdded';
const String TASKVERIFIED = '$taskManagementGatewayUrl/TaskVerified';
const String UPDATELEADERBOARD = '$taskManagementGatewayUrl/UpdateLeaderboard';
const String USERREGISTERED = '$userManagementGatewayUrl/userRegister';
const String USERSIGNIN = '$userManagementGatewayUrl/signIn';
const String USERWALLETCONNECTED =
    'https://xrpl-api-us-8l3obb9a.uc.gateway.dev/xummSignInRequest';
const String PAYMENTREQUEST =
    'https://xrpl-api-us-8l3obb9a.uc.gateway.dev/paymentrequest';
const String USERFORGOTPASSWORD = '$userManagementGatewayUrl/forgotPassword';
const String USERAUTHENTICATION = '$userManagementGatewayUrl/authenticate';
const String USERPROFILEUPDATE = '$userManagementGatewayUrl/profileUpdate';
const String USERACCOUNTDELETION = '$userManagementGatewayUrl/deleteAccount';
const String USERINTERACTION = '$userManagementGatewayUrl/userInteraction';
const String USERVERIFIED = '$userManagementGatewayUrl/userVerified';
