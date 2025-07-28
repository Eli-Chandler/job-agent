from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from types_aiobotocore_s3.client import S3Client

from sqlalchemy import select

from job_agent.models import Resume, StoredFile


class PresignedUrlService:
    def __init__(self, db: AsyncSession, client: S3Client):
        self._db = db
        self._client = client

    async def _generate_presigned_url(self, file: StoredFile):
        pass

    async def get_resume_presigned_url(self, candidate_id: int, resume_id: int) -> str:
        result = await self._db.execute(
            select(Resume)
            .where(Resume.candidate_id == candidate_id)
            .where(Resume.id == resume_id)
            .options(selectinload(Resume.stored_file))
        )
        resume: Resume | None = result.scalar_one_or_none()

