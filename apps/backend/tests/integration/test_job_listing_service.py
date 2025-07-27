import pytest
from datetime import datetime
from pydantic import HttpUrl

from job_agent.services.job_listing_service import JobService, ScrapeJobListingRequest, JobListingDTO
from job_agent.models import JobListing
from job_agent.services.exceptions import UnsupportedJobUrlException


class MockScraper:
    async def scrape_job(self, job_id: str) -> JobListing:
        return JobListing(
            title="Software Engineer",
            company="Software Corp",
            application_url=f"https://hiring.cafe/job/{job_id}",
            source="HiringCafe",
            description="An exciting software role.",
            posted_at=datetime.utcnow(),
            scraped_at=datetime.utcnow(),
        )


@pytest.fixture
def job_scraper():
    return MockScraper()


@pytest.fixture
def job_service(db_session, job_scraper):
    return JobService(db_session, job_scraper)


@pytest.mark.asyncio
async def test_fetch_job__should_work__with_valid_url(job_service, db_session):
    # Arrange
    request = ScrapeJobListingRequest(job_url="https://hiring.cafe/job/test123")

    # Act
    dto = await job_service.fetch_job(request)

    # Assert
    assert isinstance(dto, JobListingDTO)
    assert dto.title == "Software Engineer"
    assert dto.application_url == "https://hiring.cafe/job/test123"
    assert dto.source == "HiringCafe"
    assert dto.description == "An exciting software role."

    db_job = await db_session.get(JobListing, dto.id)
    assert db_job is not None
    assert db_job.application_url == "https://hiring.cafe/job/test123"


@pytest.mark.asyncio
async def test_fetch_job__should_raise__on_bad_path(job_service):
    # Arrange
    request = ScrapeJobListingRequest(job_url="https://hiring.cafe/jobs/invalid")

    # Act & Assert
    with pytest.raises(UnsupportedJobUrlException):
        await job_service.fetch_job(request)


@pytest.mark.asyncio
async def test_fetch_job__should_raise__on_missing_job_id(job_service):
    # Arrange
    request = ScrapeJobListingRequest(job_url="https://hiring.cafe/job/")

    # Act & Assert
    with pytest.raises(UnsupportedJobUrlException):
        await job_service.fetch_job(request)