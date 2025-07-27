from typing import Optional

from pydantic import BaseModel, HttpUrl
from urllib.parse import urlparse

from sqlalchemy.ext.asyncio import AsyncSession

from job_agent.scrape.job_scraper import HiringCafeJobScraper
from job_agent.models import JobListing

from datetime import datetime

from job_agent.services.exceptions import UnsupportedJobUrlException


class ScrapeJobListingRequest(BaseModel):
    job_url: HttpUrl


class JobListingDTO(BaseModel):
    id: int
    title: str
    application_url: str
    source: Optional[str]
    description: Optional[str]
    posted_at: Optional[datetime]
    scraped_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, job_listing: JobListing):
        return cls(
            id=job_listing.id,
            title=job_listing.title,
            application_url=job_listing.application_url,
            source=job_listing.source,
            description=job_listing.description,
            posted_at=job_listing.posted_at,
            scraped_at=job_listing.scraped_at,
            updated_at=job_listing.updated_at,
        )


class JobService:
    def __init__(self, db: AsyncSession, job_scraper: HiringCafeJobScraper):
        self._db = db
        self._job_scraper = job_scraper

    async def fetch_job(self, request: ScrapeJobListingRequest) -> JobListingDTO:
        job_id = self._parse_url_id(request.job_url)
        job = await self._job_scraper.scrape_job(job_id)
        self._db.add(job)
        await self._db.commit()
        return JobListingDTO.from_model(job)

    def _parse_url_id(self, job_url: HttpUrl) -> str:
        parsed_url = urlparse(str(job_url))

        if not parsed_url.path.startswith("/job/"):
            raise UnsupportedJobUrlException(job_url)

        job_id = parsed_url.path.split("/job/")[-1]
        if not job_id:
            raise UnsupportedJobUrlException(job_url)

        return job_id
