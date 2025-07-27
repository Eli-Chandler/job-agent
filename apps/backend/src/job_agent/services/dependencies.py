from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from job_agent.scrape.dependencies import get_job_scraper
from job_agent.scrape.job_scraper import HiringCafeJobScraper
from job_agent.services.candidate_service import CandidateService
from api.db import get_session
from job_agent.services.job_application_service import JobApplicationService
from job_agent.services.job_listing_service import JobService


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
