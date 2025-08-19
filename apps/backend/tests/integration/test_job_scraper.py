import pytest
from job_agent.scrape.job_scraper import HiringCafeJobScraper


@pytest.mark.asyncio
async def test_hiring_cafe_job_scraper():
    # Arrange
    scraper = HiringCafeJobScraper()
    job_id = (
        "c3VjY2Vzc2ZhY3RvcnNfX19jb21fX19Pcm9yYUdyb3VwX19fMTMwODczMTMwMA=="  # This will need to change from time to time
    )

    # Act
    result = await scraper.scrape_job(job_id)

    # Assert
    # assert result.id == job_id
    assert result.application_url is not None
    assert result.title is not None
    assert result.description is not None
    assert result.company is not None
