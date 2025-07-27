from pydantic import HttpUrl
from urllib.parse import urlparse

from sqlalchemy.ext.asyncio import AsyncSession

from job_agent.scrape.job_scraper import HiringCafeJobScraper

from job_agent.services.exceptions import UnsupportedJobUrlException
from job_agent.services.schemas import JobListingDTO, ScrapeJobListingRequest


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
