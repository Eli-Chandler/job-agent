from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from types_aiobotocore_s3.client import S3Client

from sqlalchemy import select

from job_agent.models import Resume, StoredFile
from job_agent.services.exceptions import ResumeNotFoundException


class PresignedUrlService:
    def __init__(self, db: AsyncSession, client: S3Client):
        self._db = db
        self._client = client

    async def _generate_presigned_url(self, file: StoredFile, expiration: int=60):
        return await self._client.generate_presigned_url(
            ClientMethod="get_object",
            Params={'Bucket': file.bucket, 'Key': file.key},
            ExpiresIn=60
        )

    async def get_resume_presigned_url(self, candidate_id: int, resume_id: int) -> str:
        result = await self._db.execute(
            select(Resume)
            .where(Resume.candidate_id == candidate_id)
            .where(Resume.id == resume_id)
            .options(selectinload(Resume.stored_file))
        )
        resume: Resume | None = result.scalar_one_or_none()

        if resume is None:
            raise ResumeNotFoundException(resume_id)

        return await self._generate_presigned_url(resume.stored_file)