from fastapi import APIRouter, Depends


from job_agent.services.dependencies import get_job_listing_service

from job_agent.services.job_listing_service import (
    ScrapeJobListingRequest,
    JobListingDTO,
    JobService,
)

job_listing_router = APIRouter()


@job_listing_router.post("/from-url", response_model=JobListingDTO)
async def scrape_job(
    request: ScrapeJobListingRequest,
    job_service: JobService = Depends(get_job_listing_service),
):
    return await job_service.fetch_job(request)
