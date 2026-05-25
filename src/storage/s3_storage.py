import os
import boto3
from typing import Optional

class S3Storage:
    def __init__(self):
        self.bucket = os.getenv("S3_DOCUMENT_BUCKET")
        if self.bucket:
            self.s3 = boto3.client('s3')
        else:
            self.s3 = None

    def upload_file(self, file_path: str, object_name: Optional[str] = None) -> bool:
        if not self.s3 or not self.bucket:
            return False
        if object_name is None:
            object_name = os.path.basename(file_path)
        try:
            self.s3.upload_file(file_path, self.bucket, object_name)
            return True
        except Exception as e:
            print(f"Failed to upload to S3: {e}")
            return False
