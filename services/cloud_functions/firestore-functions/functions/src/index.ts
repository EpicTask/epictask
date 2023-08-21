import {initializeApp} from "firebase-admin/app";
import axios from "axios";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import {firestore} from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import {SecretManagerServiceClient} from "@google-cloud/secret-manager";
import {Configuration, OpenAIApi} from "openai";
import {PubSub} from "@google-cloud/pubsub";

initializeApp();

const db = firestore();
const pubsub = new PubSub();
/**
 * Retrieves the latest version of a secret from Google Cloud Secret Manager.
 * @async
 * @param {String} params - The name of the secret to retrieve.
 * @return {Promise<String>} - The secret's payload data as a string.
 */
async function getSecretsClient(params: string) {
  try {
    const projectId = "672847978942";
    const client = new SecretManagerServiceClient();
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${params}/versions/latest`,
    });
    if (version?.payload?.data) {
      return version.payload.data.toString();
    } else {
      return null;
    }
  } catch (err) {
    console.error(`Error getting secret: ${err}`);
    throw new Error(`Error getting secret: ${err}`);
  }
}

/**
 * Retrieves the OpenAI client with the appropriate API key and organization.
 * @async
 * @return {Promise<OpenAIApi>} - The OpenAI client.
 */
async function getOpenaiClient() {
  try {
    // Get the organization and OpenAI API key from Google Cloud Secret Manager
    const orgKey = await getSecretsClient("open-ai-org-key");
    const secretValue = await getSecretsClient("open-ai");
    // Create a new configuration object with the retrieved keys
    const configuration = new Configuration({
      organization: orgKey ?? "",
      apiKey: secretValue ?? "",
    });
    // Create and return a new OpenAI client using the configuration object
    return new OpenAIApi(configuration);
  } catch (err) {
    console.error(`Error getting OpenAI client: ${err}`);
    throw new Error(`Error getting OpenAI client: ${err}`);
  }
}

exports.newUserCreated = functions.auth.user().onCreate((user) => {
  const email = user.email; // The email of the user.
  const imageUrl = user.photoURL;
  const uid = user.uid;
  const displayName =
    user.displayName || "user" + uid.substring(uid.length - 5);

  try {
    db.collection("users").doc(uid).set({
      email: email,
      displayName: displayName,
      imageUrl: imageUrl,
      dateCreated: FieldValue.serverTimestamp(),
      uid: uid,
    });
  } catch (error) {
    console.error("Error saving user data:", error);
    // Handle the error here, such as logging or sending a notification.
  }
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

/**
Retrieves the public address and user token of a user
document from the firestore database.
@async
@param {string} docId - The ID of the user document.
@return {Promise<{publicAddress: string, userToken: string} | null>}
 */
async function getPublicAddressAndUserToken(docId: string) {
  try {
    const userDocRef = db.collection("users").doc(docId);
    const userDocSnapshot = await userDocRef.get();

    if (userDocSnapshot.exists) {
      const userData = userDocSnapshot.data();
      return {
        publicAddress: userData?.publicAddress,
        userToken: userData?.userToken.user_token,
      };
    } else {
      console.log(`User document with ID ${docId} not found.`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

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

        if (!userId ||
          !rewardAmount ||
          !paymentMethod ||
          !rewardCurrency ||
          paymentMethod !== "Pay Directly") {
          throw new Error("Missing required fields in task document");
        }

        if (!taskEventDocData.additional_data.completed_by_id) {
          throw new Error("No user id found");
        }

        const assignedToId = taskEventDocData.additional_data.completed_by_id;

        const source = await getPublicAddressAndUserToken(userId);
        const sourceToken = source?.userToken;
        const sourcePublicAddress = source?.publicAddress;

        const destination = await getPublicAddressAndUserToken(assignedToId);
        const destinationPublicAddress = destination?.publicAddress;

        const rewardJsonMap = {
          amount: rewardAmount,
          source: sourcePublicAddress,
          destination: destinationPublicAddress,
          user_token: sourceToken,
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

// Initiate Escrow payment

exports.initiateEscrowPayment = onDocumentUpdated(
  "test_tasks/{doc}",
  async (event) => {
    try {
      const newValue = event.data?.after?.data();
      const previousValue = event.data?.before?.data();

      // Check if assigned_to_ids field has been updated
      if (
        // Check if assigned_to_ids is an array
        Array.isArray(newValue?.assigned_to_ids) &&
        // Check if the value of assigned_to_ids has changed
        newValue?.assigned_to_ids !== previousValue?.assigned_to_ids &&
        // Check if the first element exists
        newValue?.assigned_to_ids[0] !== undefined
      ) {
        console.log(newValue?.assigned_to_ids[0]);
        // Check if smart_contract_enabled exists and is true
        // If true return to avoid duplicate Escrow creation.
        if (newValue?.smart_contract_enabled === true) {
          return "Escrow exists"; // Return response as needed
        }

        const userId = newValue?.user_id;
        const assignedToId = newValue?.assigned_to_ids[0];

        const source = await getPublicAddressAndUserToken(userId);
        const sourceToken = source?.userToken;
        const sourcePublicAddress = source?.publicAddress;

        const destination = await getPublicAddressAndUserToken(assignedToId);
        const destinationPublicAddress = destination?.publicAddress;

        // Prepare data for the Axios API POST call
        const postData = {
          amount: newValue?.reward_amount,
          account: sourcePublicAddress,
          destination: destinationPublicAddress,
          user_token: sourceToken,
          finish_after: newValue?.expiration_date,
          task_id: newValue?.task_id,
          user_id: newValue?.user_id,
        };

        console.log(postData);

        // Make CreateEscrow request
        const xrplUrl = process.env.ESCROWCREATED || "";

        const response = await axios.post(xrplUrl, postData);

        return response;
      } else {
        console.log("No action needed if assigned_to_ids not updated");
      }


      return null; // No action needed if assigned_to_ids not updated
    } catch (error) {
      console.error("Error initiating Escrow transaction:", error);
      return null;
    }
  }
);

exports.deleteTaskAfterSuccessfulPayment = onDocumentCreated(
  // TODO: update collection for production
  "test_xumm_callbacks/{doc}",
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with webhook callback event");
        return;
      }
      const taskEventDocData = snapshot.data();
      if (
        taskEventDocData
          .custom_meta
          .blob
          .function === "finish_escrow_xumm" ||
        taskEventDocData
          .custom_meta
          .blob
          .function === "payment_request"
      ) {
        // Check if the task_id exists in the test_tasks collection
        const taskSnapshot = await db
          .collection("test_tasks")
          .doc(taskEventDocData.custom_meta.blob.task_id)
          .get();

        if (taskSnapshot.exists) {
          const taskData = taskSnapshot.data();
          const returnURLSigned = taskEventDocData.payloadResponse?.signed;

          if (returnURLSigned && returnURLSigned === true && taskData) {
            // Save the contents of the task_id document to new collection
            await db
              .collection("test_paid_tasks")
              .doc(taskEventDocData.custom_meta.blob.task_id)
              .set(taskData);
            db.collection("test_paid_tasks")
              .doc(taskEventDocData.custom_meta.blob.task_id)
              .update({rewarded: true});

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
      }
      return null;
    } catch (error) {
      console.error("Error deleting task:", error);
      return null;
    }
  }
);

exports.updateLeaderboard = onDocumentCreated(
  // TODO: update collection for production
  "test_paid_tasks/{doc}",
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with test paid task");
        return;
      }
      const paidTaskData = snapshot.data();

      const taskManagementUrl = process.env.UPDATELEADERBOARD || "";
      // Make an API call to the task management service
      axios.post(taskManagementUrl, paidTaskData);
      return null;
    } catch (error) {
      console.error("Error updating leaderboard:", error);
      return null;
    }
  }
);

exports.generateContract = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Unable to perform action."
    );
  }

  try {
    const openai = await getOpenaiClient();
    const taskCreated = data;
    console.log("Request Body:" + JSON.stringify(taskCreated));
    const taskCreatorName = `User ID: ${taskCreated.user_id}`;
    const taskAssigneeName =
    `User ID: ${taskCreated.additional_data.assigned_to_ids[0]}`;

    // Contract prompt
    const contractPrompt =
      "Generate a contract between Task Creator " +
      taskCreatorName +
      " (ID: " +
      taskCreated.user_id +
      ") and Task Assignee " +
      taskAssigneeName +
      " (ID: ). This contract is not bonded by any law other " +
      "than subject to EpicTask Policy. Use the following " +
      "TaskCreated data:\n\nTask Title: " +
      taskCreated.additional_data.task_title +
      "\nTask Description: " +
      taskCreated.additional_data.task_description +
      "\nTask ID: " +
      taskCreated.task_id +
      "\nProject ID: " +
      taskCreated.additional_data.project_id +
      "\nProject Name: " +
      taskCreated.additional_data.project_name +
      "\nReward Amount: " +
      taskCreated.additional_data.reward_amount +
      " " +
      taskCreated.additional_data.reward_currency +
      "\nPayment Method: " +
      taskCreated.additional_data.payment_method +
      "\n\nUser provided terms and conditions: " +
      taskCreated.additional_data.terms_blob;

    // API call
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: contractPrompt,
      max_tokens: 500,
      temperature: 0.5,
    });

    const contract = response.data.choices[0].text?.trim();
    console.log(contract);
    const docId = db.collection("test_contracts").doc().id;
    await db.collection("test_contracts").doc(docId).set({
      contract: contract,
      timestamp: FieldValue.serverTimestamp(),
    });

    return docId; // Return the docId to update task with terms_id value.
    // return contract;
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError(
      "internal",
      "Error generating contract"
    );
  }
});

// This function uses cloud scheduler as a trigger to check if any Escrows
// have expired and are ready to be executed with a finish transaction
// or cancelled.
// 'every day 05:00, 13:00, 21:00'
exports.scheduleEscrowFinish = functions.pubsub
  .schedule("0 6,14,20 * * *")
  .timeZone("UTC")
  .onRun(async (context) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = firestore.Timestamp.fromDate(today);

    try {
      const tasksSnapshot = await db
        .collection("test_tasks")
        .where("payment_method", "==", "Escrow")
        .get();

      const tasksToProcess: firestore
      .QueryDocumentSnapshot<firestore.DocumentData>[] =
        [];

      tasksSnapshot.forEach((doc) => {
        const expirationDate = doc.get("expiration_date");
        console.log(expirationDate);
        console.log(todayTimestamp.toMillis);
        if (expirationDate && expirationDate <= todayTimestamp.toMillis()) {
          tasksToProcess.push(doc);
        }
      });

      const processPromises = tasksToProcess.map(async (taskDoc) => {
        const taskId = taskDoc.id;
        console.log(taskId);
        const xrplServiceSnapshot = await db
          .collection("test_xrpl_service")
          .where("task_id", "==", taskId)
          .where("function", "==", "verify_transaction")
          .orderBy("timestamp", "desc")
          .limit(1)
          .get();

        if (!xrplServiceSnapshot.empty) {
          const xrplDoc = xrplServiceSnapshot.docs[0];
          const xrplData = xrplDoc.data();

          console.log(xrplData);
          const account = xrplData.transaction.Destination;
          const offer_sequence = xrplData.transaction.Sequence;
          const owner = xrplData.transaction.Account;
          const user_token = '';
          const user_id = '';

          const escrowJsonMap = {
            account: account,
            offer_sequence: offer_sequence,
            owner: owner,
            user_token: user_token,
            task_id: taskId,
            user_id: user_id
          };
  
          console.log(escrowJsonMap);
          const xrplUrl = process.env.PAYMENTREQUEST || "";
          const response = await axios.post(xrplUrl, escrowJsonMap);
  
          return response;

          // Publish the xrplData to the "finish_escrow" Pub/Sub topic
          const topicName = "finish_escrow";
          const data = Buffer.from(JSON.stringify(xrplData), "utf8");

          console.log(data);
          const callback = (err: any, messageId: any) => {
            if (err) {
              console.error(`Error: ${err.message}, Message ID: ${messageId}`);
            }
          };
          pubsub.topic(topicName).publishMessage({data}, callback);

          console.log(`Published data for task ${taskId} to ${topicName}`);
        }
      });

      await Promise.all(processPromises);

      return null;
    } catch (error) {
      console.error("Error scheduling escrow finish:", error);
      return null;
    }
  });

exports.handleCreateEscrowCallback = onDocumentCreated(
  // TODO: update collection for production
  "test_xumm_callbacks/{doc}",
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with document");
        return;
      }
      const callbackData = snapshot.data();

      if (callbackData.custom_meta?.blob?.function === "create_escrow_xumm") {
        const taskId = callbackData.custom_meta.blob.task_id;

        // Update the task document with smart_contract_enabled set to true
        const taskRef = db.collection("test_tasks").doc(taskId);
        await taskRef.update({smart_contract_enabled: true});

        console.log(`Smart contract enabled for task ${taskId}`);
      } else {
        console.log("Function is not create_escrow_xumm");
      }

      return null;
    } catch (error) {
      console.error("Error handling callback:", error);
      return null;
    }
  });

exports.autoVerifyTransaction = onDocumentCreated(
  // TODO: update collection for production
  "test_xumm_callbacks/{doc}",
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with document");
        return;
      }

      const callbackData = snapshot.data();

      if (callbackData.payloadResponse && callbackData.payloadResponse.txid) {
        const transactionId = callbackData.payloadResponse.txid;
        const taskId = callbackData.task_id;
        const baseUrl = process.env.VERIFYTRANSACTION || "";
        const xrplUrl = baseUrl + transactionId + '/' + taskId;

        await axios.get(xrplUrl);
      }

      return null;
    } catch (error) {
      console.error("Error handling callback:", error);
      return null;
    }
  });

// firebase deploy --only functions:updateXummUserToken
// npm run lint -- --fix
