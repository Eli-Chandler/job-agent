from fastapi import APIRouter, Depends, UploadFile, HTTPException

from api.auth import get_current_user_id
from api.dependencies import get_profile_service
from api.routers.utils import ErrorModel
from job_agent.features.profile.profile_dto import (
    CreateProfileRequest,
    UpdateProfileRequest,
    CreateExperienceRequest,
    UpdateExperienceRequest,
    UpdateLinkRequest,
    CreateLinkRequest,
    UpdateCertificationRequest,
    CreateCertificationRequest,
    UpdateSkillRequest,
    CreateSkillRequest,
    UpdateProjectRequest,
    CreateProjectRequest,
    UpdateEducationRequest,
    CreateEducationRequest,
    ProfileDTO,
    ProfileExperienceDTO,
    ProfileEducationDTO,
    ProfileProjectDTO,
    ProfileSkillDTO,
    ProfileCertificationDTO,
    ProfileLinkDTO,
)
from job_agent.features.profile.profile_service import ProfileService
from job_agent.services.schemas import FileContent

profile_router = APIRouter()


@profile_router.post(
    "/", response_model=ProfileDTO, responses={409: {"model": ErrorModel}}, operation_id="createProfile"
)
async def create_profile(
    request: CreateProfileRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.create_profile(current_user_id, request)

@profile_router.post("/create-from-resume", response_model=ProfileDTO, responses={409: {"model": ErrorModel}}, operation_id="createProfileFromResume")
async def create_profile_from_resume(
    file: UploadFile,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    if file.content_type not in ["application/pdf"]:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    file_content = FileContent(
        data=await file.read(),
        content_type=file.content_type
    )

    return await service.create_from_resume(current_user_id, file_content)



@profile_router.get("/", response_model=ProfileDTO, responses={404: {"model": ErrorModel}}, operation_id="getProfile")
async def get_profile(
    current_user_id: int = Depends(get_current_user_id), service: ProfileService = Depends(get_profile_service)
):
    return await service.get_profile(current_user_id)


@profile_router.patch(
    "/", response_model=ProfileDTO, responses={404: {"model": ErrorModel}}, operation_id="updateProfile"
)
async def update_profile(
    request: UpdateProfileRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.update_profile(current_user_id, request)


@profile_router.delete("/", response_model=None, responses={404: {"model": ErrorModel}}, operation_id="deleteProfile")
async def delete_profile(
    current_user_id: int = Depends(get_current_user_id), service: ProfileService = Depends(get_profile_service)
):
    return await service.delete_profile(current_user_id)


@profile_router.post(
    "/experiences",
    response_model=ProfileExperienceDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="addExperience",
)
async def add_experience(
    request: CreateExperienceRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.create_experience(current_user_id, request)


@profile_router.patch(
    "/experiences/{experience_id}",
    response_model=ProfileExperienceDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="updateExperience",
)
async def update_experience(
    experience_id: int,
    request: UpdateExperienceRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.update_experience(current_user_id, experience_id, request)


@profile_router.delete(
    "/experiences/{experience_id}",
    response_model=None,
    responses={404: {"model": ErrorModel}},
    operation_id="deleteExperience",
)
async def delete_experience(
    experience_id: int,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.delete_experience(current_user_id, experience_id)


@profile_router.post(
    "/educations",
    response_model=ProfileEducationDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="addEducation",
)
async def add_education(
    request: CreateEducationRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.create_education(current_user_id, request)


@profile_router.patch(
    "/educations/{education_id}",
    response_model=ProfileEducationDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="updateEducation",
)
async def update_education(
    education_id: int,
    request: UpdateEducationRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.update_education(current_user_id, education_id, request)


@profile_router.delete(
    "/educations/{education_id}",
    response_model=None,
    responses={404: {"model": ErrorModel}},
    operation_id="deleteEducation",
)
async def delete_education(
    education_id: int,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.delete_education(current_user_id, education_id)


@profile_router.post(
    "/projects", response_model=ProfileProjectDTO, responses={404: {"model": ErrorModel}}, operation_id="addProject"
)
async def add_project(
    request: CreateProjectRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.create_project(current_user_id, request)


@profile_router.patch(
    "/projects/{project_id}",
    response_model=ProfileProjectDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="updateProject",
)
async def update_project(
    project_id: int,
    request: UpdateProjectRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.update_project(current_user_id, project_id, request)


@profile_router.delete(
    "/projects/{project_id}", response_model=None, responses={404: {"model": ErrorModel}}, operation_id="deleteProject"
)
async def delete_project(
    project_id: int,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.delete_project(current_user_id, project_id)


@profile_router.post(
    "/skills", response_model=ProfileSkillDTO, responses={404: {"model": ErrorModel}}, operation_id="addSkill"
)
async def add_skill(
    request: CreateSkillRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.create_skill(current_user_id, request)


@profile_router.patch(
    "/skills/{skill_id}",
    response_model=ProfileSkillDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="updateSkill",
)
async def update_skill(
    skill_id: int,
    request: UpdateSkillRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.update_skill(current_user_id, skill_id, request)


@profile_router.delete(
    "/skills/{skill_id}", response_model=None, responses={404: {"model": ErrorModel}}, operation_id="deleteSkill"
)
async def delete_skill(
    skill_id: int,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.delete_skill(current_user_id, skill_id)


@profile_router.post(
    "/certifications",
    response_model=ProfileCertificationDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="addCertification",
)
async def add_certification(
    request: CreateCertificationRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.create_certification(current_user_id, request)


@profile_router.patch(
    "/certifications/{certification_id}",
    response_model=ProfileCertificationDTO,
    responses={404: {"model": ErrorModel}},
    operation_id="updateCertification",
)
async def update_certification(
    certification_id: int,
    request: UpdateCertificationRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.update_certification(current_user_id, certification_id, request)


@profile_router.delete(
    "/certifications/{certification_id}",
    response_model=None,
    responses={404: {"model": ErrorModel}},
    operation_id="deleteCertification",
)
async def delete_certification(
    certification_id: int,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.delete_certification(current_user_id, certification_id)


@profile_router.post(
    "/links", response_model=ProfileLinkDTO, responses={404: {"model": ErrorModel}}, operation_id="addLink"
)
async def add_link(
    request: CreateLinkRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.create_link(current_user_id, request)


@profile_router.patch(
    "/links/{link_id}", response_model=ProfileLinkDTO, responses={404: {"model": ErrorModel}}, operation_id="updateLink"
)
async def update_link(
    link_id: int,
    request: UpdateLinkRequest,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.update_link(current_user_id, link_id, request)


@profile_router.delete(
    "/links/{link_id}", response_model=None, responses={404: {"model": ErrorModel}}, operation_id="deleteLink"
)
async def delete_link(
    link_id: int,
    current_user_id: int = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return await service.delete_link(current_user_id, link_id)
