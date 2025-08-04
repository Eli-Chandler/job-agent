from fastapi import APIRouter, Depends

from api.auth import get_current_user_id
from api.dependencies import get_job_listing_service
from api.routers.utils import ErrorModel

from job_agent.services.job_listing_service import (
    JobService,
)
from job_agent.services.schemas import JobListingDTO, ScrapeJobListingRequest, CreateJobRequest

job_listing_router = APIRouter()


@job_listing_router.post(
    "/from-url", response_model=JobListingDTO, responses={404: {"model": ErrorModel}}, operation_id="createJobFromUrl"
)
async def scrape_job(
    request: ScrapeJobListingRequest,
    _current_user_id: int = Depends(get_current_user_id),  # Just making sure the user is logged in
    job_service: JobService = Depends(get_job_listing_service),
):
    return await job_service.fetch_job(request)

@job_listing_router.post(
    "/", response_model=JobListingDTO, operation_id="createJobManual"
)
async def create_job_manual(
        request: CreateJobRequest,
        _current_user_id: int = Depends(get_current_user_id),  # Just making sure the user is logged in
        job_service: JobService = Depends(get_job_listing_service)
):
    return await job_service.create_job_manual(request)