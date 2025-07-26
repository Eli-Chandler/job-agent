from fastapi import APIRouter
from fastapi.params import Depends

from job_agent.services.candidate_service import (
    CandidateDTO,
    CreateCandidateRequest,
    CandidateService,
)
from job_agent.services.dependencies import get_candidate_service

candidate_router = APIRouter()


@candidate_router.post("/", response_model=CandidateDTO)
async def create_user(
    request: CreateCandidateRequest,
    service: CandidateService = Depends(get_candidate_service),
):
    return await service.create_user(request)
