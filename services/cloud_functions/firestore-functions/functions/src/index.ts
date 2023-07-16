import * as logger from "firebase-functions/logger";
import {pubsub} from "firebase-functions/v2";
import {initializeApp} from "firebase-admin/app";
import {PubSub} from "@google-cloud/pubsub";
import axios from "axios";
import {Buffer} from "buffer";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {firestore} from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";
import * as functions from "firebase-functions";

initializeApp();
const _pubsub = new PubSub();
const db = firestore();

exports.pubsubRouter = onDocumentCreated(
  "test_task_events/{eventId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.info("No data associated with the event");
      return;
    }
    const data = snapshot.data();
    const eventType = data.event_type;

    const jsonData = JSON.stringify(data.additional_data);

    try {
      switch (eventType) {
      case "TaskCreated":
        await publishMessage("TaskCreated", jsonData);
        break;
      case "TaskAssigned":
        await publishMessage("TaskAssigned", jsonData);
        break;
      case "TaskUpdated":
        await publishMessage("TaskUpdated", jsonData);
        break;
      case "TaskCompleted":
        await publishMessage("TaskCompleted", jsonData);
        break;
      case "TaskCancelled":
        await publishMessage("TaskCancelled", jsonData);
        break;
      case "TaskCommentAdded":
        await publishMessage("TaskCommentAdded", jsonData);
        break;
      case "TaskExpired":
        await publishMessage("TaskExpired", jsonData);
        break;
      case "TaskRewarded":
        await publishMessage("TaskRewarded", jsonData);
        break;
      case "TaskRatingUpdated":
        await publishMessage("TaskRatingUpdated", jsonData);
        break;
      case "TaskVerified":
        await publishMessage("TaskVerified", jsonData);
        break;
      case "RecommendationGenerated":
        await publishMessage("RecommendationGenerated", jsonData);
        break;
      default:
        logger.info("Unknown event type:", eventType);
        break;
      }
    } catch (error) {
      logger.error("Message publishing error:", error);
      // Handle the error during message publishing
    }
  }
);

// PubSub Router for user events.
exports.pubsubUserEventRouter = onDocumentCreated(
  "test_user_events/{eventId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.info("No data associated with the event");
      return;
    }
    const data = snapshot.data();
    const eventType = data.event_type;

    const jsonData = JSON.stringify(data.additional_data);

    try {
      switch (eventType) {
      case "userRegistration":
        await publishMessage("userRegistration", jsonData);
        break;
      case "userSignIn":
        await publishMessage("userSignIn", jsonData);
        break;
      case "userWalletConnected":
        await publishMessage("userWalletConnected", jsonData);
        break;
      case "userForgotPassword":
        await publishMessage("userForgotPassword", jsonData);
        break;
      case "userAuthentication":
        await publishMessage("userAuthentication", jsonData);
        break;
      case "userProfileUpdate":
        await publishMessage("userProfileUpdate", jsonData);
        break;
      case "userAccountDeletion":
        await publishMessage("userAccountDeletion", jsonData);
        break;
      case "userInteraction":
        await publishMessage("userInteraction", jsonData);
        break;
      case "UserRegistered":
        await publishMessage("UserRegistered", jsonData);
        break;
      case "UserVerified":
        await publishMessage("UserVerified", jsonData);
        break;
      default:
        logger.info("Unknown event type:", eventType);
        break;
      }
    } catch (error) {
      logger.error("Message publishing error:", error);
      // Handle the error during message publishing
    }
  }
);
/**
 * Asynchronously publishes a message to a topic.
 * @function
 * @async
 * @param {string} topicName - The name of the topic to publish the message to.
 * @param {any} jsonData - The data of the message to be published.
 * @return {Promise<void>} - A Promise object representing
 * the completion of the message publishing.
 */
async function publishMessage(topicName: string, jsonData: any) {
  const topic = _pubsub.topic(topicName);
  const data = Buffer.from(jsonData, "utf8");

  const callback = (err: any, messageId: any) => {
    if (err) {
      logger.error(`Error: ${err.message}, Message ID: ${messageId}`);
    }
  };

  topic.publishMessage({data}, callback);
}

exports.handleTaskCreatedMessage = pubsub.onMessagePublished(
  "TaskCreated",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.TASKCREATED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleTaskAssignedMessage = pubsub.onMessagePublished(
  "TaskAssigned",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.TASKASSIGNED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleTaskUpdatedMessage = pubsub.onMessagePublished(
  "TaskUpdated",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.TASKUPDATED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleTaskCompletedMessage = pubsub.onMessagePublished(
  "TaskCompleted",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.TASKCOMPLETED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleTaskCancelledMessage = pubsub.onMessagePublished(
  "TaskCancelled",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.TASKCANCELLED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleTaskExpiredMessage = pubsub.onMessagePublished(
  "TaskExpired",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.TASKEXPIRED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleTaskRewardedMessage = pubsub.onMessagePublished(
  "TaskRewarded",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.TASKREWARDED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleTaskRatingUpdatedMessage = pubsub.onMessagePublished(
  "TaskRatingUpdated",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.TASKRATINGUPDATED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleTaskCommentAddedMessage = pubsub.onMessagePublished(
  "TaskCommentAdded",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.TASKCOMMENTADDED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleTaskVerifiedMessage = pubsub.onMessagePublished(
  "TaskVerified",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.TASKVERIFIED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleUserRegisteredMessage = pubsub.onMessagePublished(
  "UserRegistered",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the user management service URL from environment variable
      const userManagementUrl = process.env.USERREGISTERED || "";

      // Make an API call to the user management service
      const response = await axios.post(userManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleUserSignInMessage = pubsub.onMessagePublished(
  "UserSignIn",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the user management service URL from environment variable
      const userManagementUrl = process.env.USERSIGNIN || "";

      // Make an API call to the user management service
      const response = await axios.post(userManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleUserWalletConnectedMessage = pubsub.onMessagePublished(
  "UserWalletConnected",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the user management service URL from environment variable
      const userManagementUrl = process.env.USERWALLETCONNECTED || "";

      // Make an API call to the user management service
      const response = await axios.post(userManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleUserForgotPasswordMessage = pubsub.onMessagePublished(
  "UserForgotPassword",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the user management service URL from environment variable
      const userManagementUrl = process.env.USERFORGOTPASSWORD || "";

      // Make an API call to the user management service
      const response = await axios.post(userManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleUserAuthenticationMessage = pubsub.onMessagePublished(
  "UserAuthentication",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the user management service URL from environment variable
      const userManagementUrl = process.env.USERAUTHENTICATION || "";

      // Make an API call to the user management service
      const response = await axios.post(userManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleUserSignInMessage = pubsub.onMessagePublished(
  "UserProfileUpdate",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the user management service URL from environment variable
      const userManagementUrl = process.env.USERPROFILEUPDATE || "";

      // Make an API call to the user management service
      const response = await axios.post(userManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleUserAccountDeletionMessage = pubsub.onMessagePublished(
  "UserAccountDeletion",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the user management service URL from environment variable
      const userManagementUrl = process.env.USERACCOUNTDELETION || "";

      // Make an API call to the user management service
      const response = await axios.post(userManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleUserInteractionMessage = pubsub.onMessagePublished(
  "UserInteraction",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the user management service URL from environment variable
      const userManagementUrl = process.env.USERINTERACTION || "";

      // Make an API call to the user management service
      const response = await axios.post(userManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleUserVerifiedMessage = pubsub.onMessagePublished(
  "UserVerified",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the user management service URL from environment variable
      const userManagementUrl = process.env.USERVERIFIED || "";

      // Make an API call to the task management service
      const response = await axios.post(userManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.handleRecommendationGeneratedMessage = pubsub.onMessagePublished(
  "RecommendationGenerated",
  async (event) => {
    try {
      const documentData = event.data.message.json;
      // Get the task management service URL from environment variable
      const taskManagementUrl = process.env.RECOMMENDATIONGENERATED || "";

      // Make an API call to the task management service
      const response = await axios.post(taskManagementUrl, documentData);

      logger.info("API response:", response.data);
      // Handle the API response or perform any additional actions
    } catch (error) {
      logger.error("API call error:", error);
      // Handle the API call error
    }
  }
);

exports.newUserCreated = functions.auth.user().onCreate((user) => {
  const email = user.email; // The email of the user.
  const displayName = user.displayName;
  const imageUrl = user.photoURL;
  const uid = user.uid;

  db.collection("users").doc(uid).set({
    email: email,
    displayName: displayName,
    imageUrl: imageUrl,
    dateCreated: FieldValue.serverTimestamp(),
    uid: uid,
  });
});

exports.updateXummUserToken = onDocumentCreated(
  "test_xumm_callbacks/{doc}",
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with webhook callback event");
        return;
      }
      const data = snapshot.data();
      const uid = data.custom_meta.blob;
      const userToken = data.userToken;
      console.log(userToken);
      if (uid) {
        await db.collection("users").doc(uid).update({userToken: userToken});
      }
    } catch (error) {
      console.error("Error occurred while updating Xumm User Token:", error);
      // Handle the error here, log the error, or perform any necessary actions
    }
  }
);

exports.createXRPPaymentRequest = onDocumentCreated(
  "test_task_events/{doc}",
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with webhook callback event");
        return;
      }
      const taskEventDocData = snapshot.data();

      if (taskEventDocData && taskEventDocData.additional_data.verified) {
        const taskDocRef = db
          .collection("test_tasks")
          .doc(taskEventDocData.task_id);
        const taskDocSnapshot = await taskDocRef.get();
        const taskDocData = taskDocSnapshot.data();

        const userId = taskDocData?.user_id;
        const rewardAmount = taskDocData?.reward_amount;
        const paymentMethod = taskDocData?.payment_method;
        const rewardCurrency = taskDocData?.reward_currency;

        if (!userId || !rewardAmount || !paymentMethod || !rewardCurrency) {
          throw new Error("Missing required fields in task document");
        }

        if (!taskEventDocData.additional_data.completed_by_id) {
          throw new Error("No user id found");
        }

        const assignedToId = taskEventDocData.additional_data.completed_by_id;
        const usersCollectionRef = db.collection("users");
        const userQuerySnapshot = await usersCollectionRef
          .where("uid", "in", [assignedToId, userId])
          .get();
        const usersData: { [key: string]: any } = {};
        userQuerySnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          usersData[userData.uid] = {
            publicAddress: userData.publicAddress,
            userToken: userData.userToken.user_token,
          };
        });
        const rewardJsonMap = {
          amount: rewardAmount,
          source: usersData[userId].publicAddress,
          destination: usersData[assignedToId].publicAddress,
          user_token: usersData[userId].userToken,
          task_id: taskEventDocData.task_id,
        };

        console.log(rewardJsonMap);
        const xrplUrl = process.env.PAYMENTREQUEST || "";
        const response = await axios.post(xrplUrl, rewardJsonMap);

        return response; 
      } else {
        console.log("Task not verified");
        return null;
      }
    } catch (error) {
      console.error("Error creating XRP payment request:", error);
      return null;
    }
  }
);

exports.deleteTaskAfterSuccessfulPayment = onDocumentCreated(
  "test_xumm_callbacks/{doc}",
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with webhook callback event");
        return;
      }
      const taskEventDocData = snapshot.data();

      // Check if the task_id exists in the test_tasks collection
      const taskSnapshot = await db
        .collection("test_tasks")
        .doc(taskEventDocData.custom_meta.blob.task_id)
        .get();

      if (taskSnapshot.exists) {
        const taskData = taskSnapshot.data();
        const returnURLSigned = taskEventDocData.payloadResponse?.signed;

        if (returnURLSigned && returnURLSigned === true) {
          // Save the contents of the task_id document to new collection
          await db
            .collection("test_paid_tasks")
            .doc(taskEventDocData.custom_meta.blob.task_id)
            .set(taskData!);

          // Delete the original document in test_tasks
          await db
            .collection("test_tasks")
            .doc(taskEventDocData.custom_meta.blob.task_id)
            .delete();

          console.log(
            "Task saved to test_paid_tasks and deleted from test_tasks"
          );
        } else {
          console.log(
            "return_url.signed is not true, skipping document deletion"
          );
        }
      } else {
        console.log("Task does not exist in test_tasks");
      }
      return null;
    } catch (error) {
      console.error("Error deleting task:", error);
      return null;
    }
  }
);

// firebase deploy --only functions:updateXummUserToken
// npm run lint -- --fix
