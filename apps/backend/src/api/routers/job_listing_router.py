from fastapi import APIRouter, Depends


from api.dependencies import get_job_listing_service

from job_agent.services.job_listing_service import (
    JobService,
)
from job_agent.services.schemas import JobListingDTO, ScrapeJobListingRequest

job_listing_router = APIRouter()


@job_listing_router.post("/from-url", response_model=JobListingDTO)
async def scrape_job(
    request: ScrapeJobListingRequest,
    job_service: JobService = Depends(get_job_listing_service),
):
    return await job_service.fetch_job(request)
