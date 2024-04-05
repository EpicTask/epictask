import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getSecret(secret: string): Promise<string | undefined> {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.PROJECTID || '';
  const secretId = secret;
  const versionId = 'latest';

  // Access the secret version
  const name = `projects/${projectId}/secrets/${secretId}/versions/${versionId}`;
  const [version] = await client.accessSecretVersion({ name });

  if (version && version.payload && version.payload.data) {
    // Extract the secret value
    const secretValue = version.payload.data.toString();
    return secretValue;
  }

  // Return undefined if the secret is not found
  return undefined;
}

export default getSecret;