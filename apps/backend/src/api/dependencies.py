from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from job_agent.scrape.dependencies import get_job_scraper
from job_agent.scrape.job_scraper import HiringCafeJobScraper
from job_agent.services.candidate_service import CandidateService
from api.db import get_session
from api.config import settings

from job_agent.services.job_application_service import JobApplicationService
from job_agent.services.job_listing_service import JobService


import aioboto3
from botocore.config import Config
from functools import lru_cache



async def get_candidate_service(
    db: AsyncSession = Depends(get_session),
) -> CandidateService:
    return CandidateService(db)


async def get_job_listing_service(
    job_scraper: HiringCafeJobScraper = Depends(get_job_scraper),
    db: AsyncSession = Depends(get_session),
) -> JobService:
    return JobService(db, job_scraper)


async def get_job_application_service(
    db: AsyncSession = Depends(get_session),
):
    return JobApplicationService(db)

session = aioboto3.Session(

)

@lru_cache
async def get_s3_client():
    client = await session.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key_id,
        aws_secret_access_key=settings.s3_secret_access_key,
        region_name=settings.s3_region_name,
        config=Config(s3={"addressing_style": "path"})
    )
    return client