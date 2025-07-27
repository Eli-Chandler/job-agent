from typing import Optional

from types_aiobotocore_s3.client import S3Client
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from job_agent.models import StoredFile
from job_agent.services.schemas import FileContent


class S3FileUploader:
    def __init__(self, db: AsyncSession, s3_client: S3Client, bucket_name: str):
        self._db = db
        self._s3 = s3_client
        self._bucket = bucket_name

    async def upload(self, file: FileContent,  key: Optional[str] = None) -> StoredFile:
        if not key:
            key = str(uuid.uuid4())

        await self._s3.put_object(Bucket=self._bucket, Key=key, Body=file.data, ContentType=file.content_type)

        stored_file = StoredFile(
            key=key,
            bucket=self._bucket,
            content_type=file.content_type
        )

        self._db.add(stored_file)
        await self._db.commit()

        return stored_file