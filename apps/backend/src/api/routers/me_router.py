from fastapi import APIRouter, Depends, Response, status

from api.auth import get_current_user_id
from api.routers.utils import ErrorModel
from job_agent.services.candidate_service import (
    CandidateService,
)
from job_agent.services.schemas import AddOrUpdateSocialRequest, CandidateDTO, CandidateSocialLinkDTO, \
    UpdateCandidatePersonalInfoRequest
from api.dependencies import get_candidate_service

me_router = APIRouter()


@me_router.get(
    "/",
    response_model=CandidateDTO,
    responses={
        404: {"model": ErrorModel}
    }
)
async def get_me(
    current_user_id: int = Depends(get_current_user_id),
    service: CandidateService = Depends(get_candidate_service),
):
    return await service.get_candidate_by_id(current_user_id)

@me_router.patch(
    "/",
    response_model=CandidateDTO,
    responses={
        404: {"model": ErrorModel}
    }
)
async def update_me_info(
        request: UpdateCandidatePersonalInfoRequest,
        current_user_id: int = Depends(get_current_user_id),
        service: CandidateService = Depends(get_candidate_service),
):
    return await service.update_candidate_personal_info(current_user_id, request)

@me_router.get(
    "/socials",
    response_model=list[CandidateSocialLinkDTO],
    responses={
        404: {"model": ErrorModel}
    }
)
async def get_me_socials(
        current_user_id: int = Depends(get_current_user_id),
        service: CandidateService = Depends(get_candidate_service),
):
    return await service.get_candidate_socials(current_user_id)

@me_router.put(
    "/socials",
    response_model=CandidateSocialLinkDTO,
    responses={
        404: {"model": ErrorModel}
    }
)
async def add_social_link(
    request: AddOrUpdateSocialRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: CandidateService = Depends(get_candidate_service),
):
    return await service.add_or_update_social_link(current_user_id, request)


@me_router.delete(
    "/socials/{social_id}",
    responses={
        404: {"model": ErrorModel}
    }
)
async def remove_social_link(
    social_id: int,
    current_user_id: int = Depends(get_current_user_id),
    service: CandidateService = Depends(get_candidate_service),
):
    await service.delete_social_link(current_user_id, social_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
