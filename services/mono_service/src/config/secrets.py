from google.cloud import secretmanager
import os

from .logging_config import get_logger

logger = get_logger(__name__)

def get_secret(secret_id: str, version_id: str = "latest") -> str:
    """
    Retrieve secret from Google Secret Manager.
    
    Args:
        secret_id: Secret name to retrieve
        version_id: Version of the secret (default: latest)
        
    Returns:
        Secret value as string
    """
    # Allow local override via env vars for development
    if os.environ.get(secret_id.upper()):
        return os.environ.get(secret_id.upper())

    try:
        client = secretmanager.SecretManagerServiceClient()
        # Project ID should ideally come from env or config
        project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "task-coin-384722")
        
        name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
        response = client.access_secret_version(request={"name": name})
        
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        logger.error(f"Error retrieving secret {secret_id}: {e}")
        return ""
