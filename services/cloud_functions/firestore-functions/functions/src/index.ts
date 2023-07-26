import {initializeApp} from "firebase-admin/app";
import axios from "axios";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {firestore} from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import {SecretManagerServiceClient} from "@google-cloud/secret-manager";
import {Configuration, OpenAIApi} from "openai";

initializeApp();

const db = firestore();
/**
 * Retrieves the latest version of a secret from Google Cloud Secret Manager.
 * @async
 * @param {String} params - The name of the secret to retrieve.
 * @return {Promise<String>} - The secret's payload data as a string.
 */
async function getSecretsClient(params: any) {
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
          db.collection("test_paid_tasks")
            .doc(taskEventDocData.custom_meta.blob.task_id)
            .update({rewarded: true}!);

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
    const taskAssigneeName = `User ID: ${taskCreated
      .additional_data.assigned_to_ids[0]}`;

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
    // const docId = db.collection("test_contracts").doc().id;
    // await db.collection("test_contracts").doc(docId).set({
    //   contract: contract,
    //   timestamp: FieldValue.serverTimestamp(),
    // });

    // return docId; // Return the docId to update task with terms_id value.
    return contract;
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError(
      "internal",
      "Error generating contract"
    );
  }
});
// firebase deploy --only functions:updateXummUserToken
// npm run lint -- --fix
