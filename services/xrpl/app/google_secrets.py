from google.cloud import secretmanager

def get_secret(secret):
    client = secretmanager.SecretManagerServiceClient()
    project_id = 'task-coin-384722'
    secret_id = secret
    version_id = 'latest'

    # Access the secret version
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = client.access_secret_version(request={"name": name})

    # Extract the secret value
    secret_value = response.payload.data.decode("UTF-8")
    
    # Use the secret value in your app
    # ...
    return secret_value
