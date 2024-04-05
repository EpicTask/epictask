import os
import uuid
from google.cloud import storage
from google.cloud.exceptions import GoogleCloudError

def write_to_gcs(address, element):
        try:
            # Initialize the Google Cloud Storage client
            storage_client = storage.Client()

            folder_name = os.environ.get("GSCFOLDERNAME")
            bucket_name = os.environ.get("BUCKETNAME")
            bucket = storage_client.get_bucket(bucket_name)

            # Upload the JSON string to the specified location in the bucket
            blob = bucket.blob(f"{folder_name}/{address}.json")
            blob.upload_from_string(element)

            print(
                f"File {address} uploaded to {bucket_name}/{folder_name}")
        except GoogleCloudError as e:
            # Handle Google Cloud Storage-related errors
            print(f"Google Cloud Storage Error: {e}")
        except Exception as e:
            # Handle other exceptions
            print(f"Error: {e}")