from typing import Optional, Any, AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from types_aiobotocore_s3 import S3Client

from job_agent.scrape.dependencies import get_job_scraper
from job_agent.scrape.job_scraper import HiringCafeJobScraper
from job_agent.services.candidate_service import CandidateService
from api.db import get_db_session
from api.config import settings

from job_agent.services.job_application_service import JobApplicationService
from job_agent.services.job_listing_service import JobService


import aioboto3
from botocore.config import Config

from job_agent.services.resume_service import ResumeService
from job_agent.services.s3_file_uploader import S3FileUploader


_session = aioboto3.Session()


async def get_s3_client() -> AsyncGenerator[S3Client, None]:
    async with _session.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key_id,
        aws_secret_access_key=settings.s3_secret_access_key,
        region_name=settings.s3_region_name,
        config=Config(s3={"addressing_style": "path"}),
    ) as s3_client:
        yield s3_client


async def get_s3_file_uploader(
    db: AsyncSession = Depends(get_db_session),
    s3_client: S3Client = Depends(get_s3_client),
):
    return S3FileUploader(db, s3_client, settings.s3_bucket_name)


async def get_candidate_service(
    db: AsyncSession = Depends(get_db_session),
    s3_file_uploader: S3FileUploader = Depends(get_s3_file_uploader),
) -> CandidateService:
    return CandidateService(db, s3_file_uploader)


async def get_job_listing_service(
    job_scraper: HiringCafeJobScraper = Depends(get_job_scraper),
    db: AsyncSession = Depends(get_db_session),
) -> JobService:
    return JobService(db, job_scraper)


async def get_job_application_service(
    db: AsyncSession = Depends(get_db_session),
) -> JobApplicationService:
    return JobApplicationService(db)


async def get_resume_service(
    db: AsyncSession = Depends(get_db_session),
    s3_file_uploader: S3FileUploader = Depends(get_s3_file_uploader),
) -> ResumeService:
    return ResumeService(db, s3_file_uploader)
