from fastapi import APIRouter, Depends

from api.auth import get_current_user_id
from job_agent.services.dependencies import get_job_application_service

from job_agent.services.job_application_service import (
    JobApplicationDTO,
    JobApplicationService,
    CreateJobApplicationRequest,
)

job_application_router = APIRouter()


@job_application_router.post("/", response_model=JobApplicationDTO)
async def apply_job(
    request: CreateJobApplicationRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: JobApplicationService = Depends(get_job_application_service),
):
    return await service.create_job_application(current_user_id, request)
