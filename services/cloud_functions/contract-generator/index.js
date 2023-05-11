import { http } from "@google-cloud/functions-framework";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { Configuration, OpenAIApi } from "openai";

// Register an HTTP function with the Functions Framework that will be executed
// when you make an HTTP request to the deployed function's endpoint.
http("helloHttp", (req, res) => {
  res.send("Hello World!");
});

/**
 * Retrieves the latest version of a secret from Google Cloud Secret Manager.
 * @async
 * @param {String} params - The name of the secret to retrieve.
 * @return {Promise<String>} - The secret's payload data as a string.
 */
async function getSecretsClient(params) {
  try {
    const projectId = "672847978942";
    const client = new SecretManagerServiceClient();
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${params}/versions/latest`,
    });
    return version.payload.data.toString();
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
      organization: orgKey,
      apiKey: secretValue,
    });
    // Create and return a new OpenAI client using the configuration object
    return new OpenAIApi(configuration);
  } catch (err) {
    console.error(`Error getting OpenAI client: ${err}`);
    throw new Error(`Error getting OpenAI client: ${err}`);
  }
}

http("generateContract", async (req, res) => {
  try {
    const openai = await getOpenaiClient();
    const taskCreated = req.body; // Assuming the taskCreated data is sent in the request body
    const taskCreatorName = "User 1";
    const taskAssigneeName = "User 2";

    const contractPrompt = `Generate a contract between Task Creator ${taskCreatorName} (ID: ${taskCreated.user_id}) and Task Assignee ${taskAssigneeName} (ID: ) using the following TaskCreated data:\n\nTask Title: ${taskCreated.additional_data.task_title}\nTask Description: ${taskCreated.additional_data.task_description}\nTask ID: ${taskCreated.task_id}\nProject ID: ${taskCreated.additional_data.project_id}\nProject Name: ${taskCreated.additional_data.project_name}\nReward Amount: ${taskCreated.additional_data.reward_amount} ${taskCreated.additional_data.reward_currency}\nPayment Method: ${taskCreated.additional_data.payment_method}\n\nUser provided terms and conditions: ${taskCreated.additional_data.terms_blob}\n\nContract:`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: contractPrompt,
      max_tokens: 500,
      temperature: 0.5,
    });

    const contract = response.data.choices[0].text.trim();
    res.status(200).send(contract);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating contract");
  }
});
