from fastapi import APIRouter, Depends, Response, status

from api.auth import get_current_user_id
from job_agent.services.candidate_service import (
    CandidateDTO,
    CandidateService,
    CandidateSocialLinkDTO,
    AddOrUpdateSocialRequest,
)
from job_agent.services.dependencies import get_candidate_service

me_router = APIRouter()


@me_router.get("/", response_model=CandidateDTO)
async def get_me(
    current_user_id: int = Depends(get_current_user_id),
    service: CandidateService = Depends(get_candidate_service),
):
    return await service.get_candidate_by_id(current_user_id)


@me_router.put("/socials", response_model=CandidateSocialLinkDTO)
async def add_social_link(
    request: AddOrUpdateSocialRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: CandidateService = Depends(get_candidate_service),
):
    return await service.add_or_update_social_link(current_user_id, request)


@me_router.delete("/socials/{social_id}")
async def remove_social_link(
    social_id: int,
    current_user_id: int = Depends(get_current_user_id),
    service: CandidateService = Depends(get_candidate_service),
):
    await service.delete_social_link(current_user_id, social_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
