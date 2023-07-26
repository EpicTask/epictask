import 'package:epictask/models/task_event_model/task_event.dart';
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
        print(
          'Unknown event type: $eventType',
        );
        break;
    }
    return 'Event handled.';
  } catch (error) {
    print(
      'Message publishing error: $error',
    );
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

const String TASKCREATED =
    'https://task-management-5wpxgn35iq-uc.a.run.app/TaskCreated';
const String TASKASSIGNED =
    'https://task-management-5wpxgn35iq-uc.a.run.app/TaskAssigned';
const String TASKUPDATED =
    'https://task-management-5wpxgn35iq-uc.a.run.app/TaskUpdated';
const String TASKCOMPLETED =
    'https://task-management-5wpxgn35iq-uc.a.run.app/TaskCompleted';
const String TASKCANCELLED =
    'https://task-management-5wpxgn35iq-uc.a.run.app/TaskCancelled';
const String TASKEXPIRED =
    'https://task-management-5wpxgn35iq-uc.a.run.app/TaskExpired';
const String TASKREWARDED =
    'https://task-management-5wpxgn35iq-uc.a.run.app/TaskRewarded';
const String TASKRATINGUPDATE =
    'https://task-management-5wpxgn35iq-uc.a.run.app/TaskRatingUpdate';
const String TASKCOMMENTADDED =
    'https://task-management-5wpxgn35iq-uc.a.run.app/TaskCommentAdded';
const String TASKVERIFIED =
    'https://task-management-5wpxgn35iq-uc.a.run.app/TaskVerified';
const String UPDATELEADERBOARD =
    'https://task-management-5wpxgn35iq-uc.a.run.app/UpdateLeaderboard';
const String USERREGISTERED =
    'https://user-management-5wpxgn35iq-uc.a.run.app/userRegister';
const String USERSIGNIN =
    'https://user-management-5wpxgn35iq-uc.a.run.app/signIn';
const String USERWALLETCONNECTED =
    'https://xrpl-5wpxgn35iq-uc.a.run.app/xummSignInRequest';
const String PAYMENTREQUEST =
    'https://xrpl-5wpxgn35iq-uc.a.run.app/paymentrequest';
const String USERFORGOTPASSWORD =
    'https://user-management-5wpxgn35iq-uc.a.run.app/forgotPassword';
const String USERAUTHENTICATION =
    'https://user-management-5wpxgn35iq-uc.a.run.app/authenticate';
const String USERPROFILEUPDATE =
    'https://user-management-5wpxgn35iq-uc.a.run.app/profileUpdate';
const String USERACCOUNTDELETION =
    'https://user-management-5wpxgn35iq-uc.a.run.app/deleteAccount';
const String USERINTERACTION =
    'https://user-management-5wpxgn35iq-uc.a.run.app/userInteraction';
const String USERVERIFIED =
    'https://user-management-5wpxgn35iq-uc.a.run.app/userVerified';