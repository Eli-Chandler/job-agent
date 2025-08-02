from typing import Annotated

from fastapi import APIRouter, Depends, Response, status, Form, UploadFile

from api.auth import get_current_user_id
from api.routers.utils import ErrorModel
from job_agent.services.candidate_service import (
    CandidateService,
)
from job_agent.services.resume_service import ResumeService
from job_agent.services.schemas import (
    AddOrUpdateSocialRequest,
    CandidateDTO,
    CandidateSocialLinkDTO,
    UpdateCandidatePersonalInfoRequest,
    UploadResumeRequest,
    FileContent,
    ResumeDTO,
    PresignedUrlDTO,
)
from api.dependencies import get_candidate_service, get_resume_service

me_router = APIRouter()


@me_router.get(
    "/",
    response_model=CandidateDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="getCurrentlyAuthenticatedUser",
)
async def get_me(
    current_user_id: int = Depends(get_current_user_id),
    service: CandidateService = Depends(get_candidate_service),
):
    return await service.get_candidate_by_id(current_user_id)


@me_router.patch(
    "/",
    response_model=CandidateDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="updateCurrentlyAuthenticatedUser",
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
    responses={404: {"model": ErrorModel}},
    operation_id="getSocialLinks",
)
async def get_me_socials(
    current_user_id: int = Depends(get_current_user_id),
    service: CandidateService = Depends(get_candidate_service),
):
    return await service.get_candidate_socials(current_user_id)


@me_router.put(
    "/socials",
    response_model=CandidateSocialLinkDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="updateSocialLink",
)
async def add_social_link(
    request: AddOrUpdateSocialRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: CandidateService = Depends(get_candidate_service),
):
    return await service.add_or_update_social_link(current_user_id, request)


@me_router.delete(
    "/socials/{social_id}",
    responses={404: {"model": ErrorModel}},
    operation_id="deleteSocialLink",
)
async def remove_social_link(
    social_id: int,
    current_user_id: int = Depends(get_current_user_id),
    service: CandidateService = Depends(get_candidate_service),
):
    await service.delete_social_link(current_user_id, social_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@me_router.get(
    "/resumes",
    response_model=list[ResumeDTO],
    responses={404: {"model": ErrorModel}},
    operation_id="getResumes",
)
async def get_resumes(
    current_user_id: int = Depends(get_current_user_id),
    service: ResumeService = Depends(get_resume_service),
):
    return await service.get_resumes_by_candidate_id(current_user_id)


@me_router.post(
    "/resumes",
    response_model=ResumeDTO,
    responses={404: {"model": ErrorModel}, 409: {"model": ErrorModel}},
    operation_id="uploadResume",
)
async def upload_resume(
    name: Annotated[str, Form()],
    file: UploadFile,
    current_user_id: int = Depends(get_current_user_id),
    service: ResumeService = Depends(get_resume_service),
):
    return await service.upload_resume(
        current_user_id,
        UploadResumeRequest(
            name=name,
            file=FileContent(
                data=file.file.read(), content_type=str(file.content_type)
            ),
        ),
    )


@me_router.get(
    "/resumes/{resume_id}/presigned-url",
    response_model=PresignedUrlDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="getResumePresignedUrl",
)
async def get_resume_presigned_url(
    resume_id: int,
    current_user_id: int = Depends(get_current_user_id),
    service: ResumeService = Depends(get_resume_service),
):
    return await service.get_resume_presigned_url(current_user_id, resume_id)
