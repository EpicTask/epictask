import {PubSub} from '@google-cloud/pubsub';
import {
  handleRecommendationGeneratedMessage,
  handleTaskAssignedMessage,
  handleTaskCancelledMessage,
  handleTaskCommentAddedMessage,
  handleTaskCompletedMessage,
  handleTaskCreatedMessage,
  handleTaskExpiredMessage,
  handleTaskRatingUpdateMessage,
  handleTaskRewardedMessage,
  handleTaskUpdatedMessage,
  handleTaskVerifiedMessage,
} from './tast_message_handlers.js';
import {
  handleUserSignInMessage,
  handleUserAccountDeletionMessage,
  handleUserAuthenticationMessage,
  handleUserForgotPasswordMessage,
  handleUserInteractionMessage,
  handleUserProfileUpdateMessage,
  handleUserRegisteredMessage,
  handleUserVerifiedMessage,
  handleUserWalletConnectedMessage,
} from './user_message_handlers.js';

const _pubsub = new PubSub({projectId: 'task-coin-384722'});

async function eventHandler(event) {
  const eventType = event.event_type;

  const jsonData = JSON.stringify(event.additional_data);

  try {
    switch (eventType) {
      case 'TaskCreated':
        await publishMessage('TaskCreated', jsonData);
        break;
      case 'TaskAssigned':
        await publishMessage('TaskAssigned', jsonData);
        break;
      case 'TaskUpdated':
        await publishMessage('TaskUpdated', jsonData);
        break;
      case 'TaskCompleted':
        await publishMessage('TaskCompleted', jsonData);
        break;
      case 'TaskCancelled':
        await publishMessage('TaskCancelled', jsonData);
        break;
      case 'TaskCommentAdded':
        await publishMessage('TaskCommentAdded', jsonData);
        break;
      case 'TaskExpired':
        await publishMessage('TaskExpired', jsonData);
        break;
      case 'TaskRewarded':
        await publishMessage('TaskRewarded', jsonData);
        break;
      case 'TaskRatingUpdated':
        await publishMessage('TaskRatingUpdated', jsonData);
        break;
      case 'TaskVerified':
        await publishMessage('TaskVerified', jsonData);
        break;
      case 'RecommendationGenerated':
        await publishMessage('RecommendationGenerated', jsonData);
        break;
      case 'UserRegistered':
        await publishMessage('UserRegistered', jsonData);
        break;
      case 'UserSignIn':
        await publishMessage('UserSignIn', jsonData);
        break;
      case 'UserWalletConnected':
        await publishMessage('UserWalletConnected', jsonData);
        break;
      case 'UserForgotPassword':
        await publishMessage('UserForgotPassword', jsonData);
        break;
      case 'UserAuthentication':
        await publishMessage('UserAuthentication', jsonData);
        break;
      case 'UserProfileUpdate':
        await publishMessage('UserProfileUpdate', jsonData);
        break;
      case 'UserAccountDeletion':
        await publishMessage('UserAccountDeletion', jsonData);
        break;
      case 'UserInteraction':
        await publishMessage('UserInteraction', jsonData);
        break;
      case 'UserVerified':
        await publishMessage('UserVerified', jsonData);
        break;
      default:
        console.info('Unknown event type:', eventType);
        break;
    }
    return 'Event handled.';
  } catch (error) {
    console.error('Message publishing error:', error);
    // Handle the error during message publishing
  }
}
/**
 * Asynchronously publishes a message to a topic.
 * @function
 * @async
 * @param {string} topicName - The name of the topic to publish the message to.
 * @param {any} jsonData - The data of the message to be published.
 * @return {Promise<void>} - A Promise object representing
 * the completion of the message publishing.
 */
async function publishMessage(topicName, jsonData) {
  try {
    const topic = _pubsub.topic(topicName);
    const data = Buffer.from(jsonData, 'utf8');
    const callback = (err, messageId) => {
      if (err) {
        console.error(`Error: ${err.message}, Message ID: ${messageId}`);
      }
    };
    topic.publishMessage({data}, callback);
  } catch (error) {
    console.error('An error occurred while publishing message:', error);
  }
}

// ... Implement functions for other topics ...

// Subscribe to each topic and attach the respective message handlers
async function subscribeToTopic(topicName, handler) {
  try {
    const subscription = _pubsub.topic(topicName).subscription(topicName);
    subscription.on('message', (message) => {
      message.ack();
      handler(message);
    });
  } catch (error) {
    console.error('An error occurred while subscribing to topic:', error);
  }
}

// Subscribe to each topic and attach the respective message handlers
subscribeToTopic('TaskCreated', handleTaskCreatedMessage);
subscribeToTopic('TaskAssigned', handleTaskAssignedMessage);
subscribeToTopic('TaskUpdated', handleTaskUpdatedMessage);
subscribeToTopic('TaskCompleted', handleTaskCompletedMessage);
subscribeToTopic('TaskCancelled', handleTaskCancelledMessage);
subscribeToTopic('TaskCommentAdded', handleTaskCommentAddedMessage);
subscribeToTopic('TaskExpired', handleTaskExpiredMessage);
subscribeToTopic('TaskRewarded', handleTaskRewardedMessage);
subscribeToTopic('TaskRatingUpdated', handleTaskRatingUpdateMessage);
subscribeToTopic('TaskVerified', handleTaskVerifiedMessage);
subscribeToTopic(
  'RecommendationGenerated',
  handleRecommendationGeneratedMessage
);
subscribeToTopic('UserSignIn', handleUserSignInMessage);
subscribeToTopic('UserWalletConnected', handleUserWalletConnectedMessage);
subscribeToTopic('UserForgotPassword', handleUserForgotPasswordMessage);
subscribeToTopic('UserAuthentication', handleUserAuthenticationMessage);
subscribeToTopic('UserProfileUpdate', handleUserProfileUpdateMessage);
subscribeToTopic('UserAccountDeletion', handleUserAccountDeletionMessage);
subscribeToTopic('UserInteraction', handleUserInteractionMessage);
subscribeToTopic('UserVerified', handleUserVerifiedMessage);
subscribeToTopic('UserRegistered', handleUserRegisteredMessage);

// Keep the program running to receive messages

export {eventHandler};

// 'TaskAssigned',
//   'TaskUpdated',
//   'TaskCompleted',
//   'TaskCancelled',
//   'TaskCommentAdded',
//   'TaskExpired',
//   'TaskRewarded',
//   'TaskRatingUpdated',
//   'TaskVerified',
//   'RecommendationGenerated',
//   'UserRegistration',
//   'UserSignIn',
//   'UserWalletConnected',
//   'UserForgotPassword',
//   'UserAuthentication',
//   'UserProfileUpdate',
//   'UserAccountDeletion',
//   'UserInteraction',
//   'UserRegistered',
//   'UserVerified';
