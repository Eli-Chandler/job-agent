from fastapi import APIRouter, Depends

from api.auth import get_current_user_id
from api.dependencies import get_job_application_service

from job_agent.services.job_application_service import (
    JobApplicationService,
)
from job_agent.services.schemas import CreateJobApplicationRequest, JobApplicationDTO

job_application_router = APIRouter()


@job_application_router.post("/", response_model=JobApplicationDTO)
async def apply_job(
    request: CreateJobApplicationRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: JobApplicationService = Depends(get_job_application_service),
):
    return await service.create_job_application(current_user_id, request)
