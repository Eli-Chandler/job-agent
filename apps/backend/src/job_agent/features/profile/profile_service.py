from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from job_agent.features.profile.profile_dto import (
    CreateProfileRequest,
    ProfileDTO,
    UpdateProfileRequest,
    CreateExperienceRequest,
    ProfileExperienceDTO,
    UpdateExperienceRequest,
    CreateEducationRequest,
    ProfileEducationDTO,
    UpdateEducationRequest,
    CreateProjectRequest,
    ProfileProjectDTO,
    UpdateProjectRequest,
    CreateSkillRequest,
    ProfileSkillDTO,
    UpdateSkillRequest,
    CreateCertificationRequest,
    ProfileCertificationDTO,
    UpdateCertificationRequest,
    CreateLinkRequest,
    ProfileLinkDTO,
    UpdateLinkRequest,
)
from job_agent.features.profile.profile_exceptions import (
    ProfileConflictException,
    ProfileNotFoundForCandidateException,
    ProfileExperienceNotFoundException,
    ProfileEducationNotFoundException,
    ProfileProjectNotFoundException,
    ProfileSkillNotFoundException,
    ProfileCertificationNotFoundException,
    ProfileLinkNotFoundException,
)
from job_agent.features.profile.profile_model import (
    Profile,
    ProfileExperience,
    ProfileEducation,
    ProfileProject,
    ProfileSkill,
    ProfileCertification,
    ProfileLink,
)
from job_agent.features.candidate.candidate_model import Candidate
from job_agent.services.exceptions import CandidateNotFoundException
from job_agent.services.schemas import FileContent


class CreateFromResumeFormat:
    profile: CreateProfileRequest
    experiences: list[CreateExperienceRequest] = []
    educations: list[CreateEducationRequest] = []
    projects: list[CreateProjectRequest] = []
    skills: list[CreateSkillRequest] = []
    certifications: list[CreateCertificationRequest] = []


class UpdateFromResumeFormat:
    experiences: list[CreateExperienceRequest] = []
    educations: list[CreateEducationRequest] = []
    projects: list[CreateProjectRequest] = []
    skills: list[CreateSkillRequest] = []
    certifications: list[CreateCertificationRequest] = []


class ProfileService:
    def __init__(self, db: AsyncSession):
        self._db = db

    async def create_from_resume(self, candidate_id: int, resume: FileContent) -> ProfileDTO:
        pass

    async def update_from_resume(self, candidate_id: int, resume: FileContent) -> ProfileDTO:
        pass

    # ==== Profile ====

    async def create_profile(self, candidate_id: int, request: CreateProfileRequest) -> ProfileDTO:
        result = await self._db.execute(
            select(Candidate).where(Candidate.id == candidate_id).options(selectinload(Candidate.profile))
        )
        candidate = result.scalar_one_or_none()

        if candidate is None:
            raise CandidateNotFoundException(candidate_id=candidate_id)

        if candidate.profile is not None:
            raise ProfileConflictException(candidate_id=candidate_id)

        new_profile = Profile(
            first_name=request.first_name,
            last_name=request.last_name,
            contact_email=str(request.contact_email),
            candidate=candidate,
            contact_phone=request.contact_phone,
            work_location=request.work_location,
            summary=request.summary,
        )
        self._db.add(new_profile)
        await self._db.commit()

        return ProfileDTO.from_model(new_profile)

    async def get_profile(self, candidate_id: int) -> ProfileDTO:
        result = await self._db.execute(
            select(Profile)
            .where(Profile.candidate_id == candidate_id)
            .options(
                selectinload(Profile.educations),
                selectinload(Profile.experiences),
                selectinload(Profile.candidate),
                selectinload(Profile.projects),
                selectinload(Profile.certifications),
                selectinload(Profile.links),
                selectinload(Profile.skills)
            )
        )
        profile = result.scalar_one_or_none()

        if profile is None:
            raise ProfileNotFoundForCandidateException(candidate_id=candidate_id)

        return ProfileDTO.from_model(profile)

    async def update_profile(self, candidate_id: int, request: UpdateProfileRequest) -> ProfileDTO:
        result = await self._db.execute(
            select(Profile)
            .where(Profile.candidate_id == candidate_id)
            .options(
                selectinload(Profile.educations),
                selectinload(Profile.experiences),
                selectinload(Profile.candidate),
                selectinload(Profile.projects),
                selectinload(Profile.certifications),
                selectinload(Profile.links),
                selectinload(Profile.skills)
            )
        )
        profile = result.scalar_one_or_none()

        if profile is None:
            raise ProfileNotFoundForCandidateException(candidate_id=candidate_id)

        updates = request.model_dump(exclude_unset=True)

        if "first_name" in updates and request.first_name is not None:
            profile.first_name = request.first_name
        if "last_name" in updates and request.last_name is not None:
            profile.last_name = request.last_name
        if "contact_email" in updates and request.contact_email is not None:
            profile.contact_email = str(request.contact_email)
        if "contact_phone" in updates:
            profile.contact_phone = request.contact_phone
        if "work_location" in updates:
            profile.work_location = request.work_location
        if "summary" in updates:
            profile.summary = request.summary

        await self._db.commit()

        return ProfileDTO.from_model(profile)

    async def delete_profile(self, candidate_id: int) -> None:
        result = await self._db.execute(select(Profile).where(Profile.candidate_id == candidate_id))
        profile = result.scalar_one_or_none()
        if profile is None:
            raise ProfileNotFoundForCandidateException(candidate_id=candidate_id)

        await self._db.delete(profile)
        await self._db.commit()

    # ==== Experience ====

    async def create_experience(self, candidate_id: int, request: CreateExperienceRequest) -> ProfileExperienceDTO:
        result = await self._db.execute(
            select(Profile).where(Profile.candidate_id == candidate_id).options(selectinload(Profile.experiences))
        )
        profile = result.scalar_one_or_none()

        if profile is None:
            raise ProfileNotFoundForCandidateException(candidate_id=candidate_id)

        experience = ProfileExperience(
            company=request.company,
            title=request.title,
            start_date=request.start_date,
            description=request.description,
            end_date=request.end_date,
            profile=profile,
        )
        self._db.add(experience)
        await self._db.commit()
        return ProfileExperienceDTO.from_model(experience)

    async def update_experience(
        self, candidate_id: int, experience_id: int, request: UpdateExperienceRequest
    ) -> ProfileExperienceDTO:
        result = await self._db.execute(
            select(ProfileExperience)
            .where(ProfileExperience.id == experience_id)
            .where(ProfileExperience.profile.has(candidate_id=candidate_id))
        )
        experience = result.scalar_one_or_none()

        if experience is None:
            raise ProfileExperienceNotFoundException(experience_id)

        updates = request.model_dump(exclude_unset=True)

        if "company" in updates and request.company is not None:
            experience.company = request.company
        if "title" in updates and request.title is not None:
            experience.title = request.title
        if "description" in updates:
            experience.description = request.description
        if "start_date" in updates and request.start_date is not None:
            experience.start_date = request.start_date
        if "end_date" in updates:
            experience.end_date = request.end_date

        await self._db.commit()
        return ProfileExperienceDTO.from_model(experience)

    async def delete_experience(self, candidate_id: int, experience_id: int) -> None:
        result = await self._db.execute(
            select(ProfileExperience)
            .where(ProfileExperience.id == experience_id)
            .where(ProfileExperience.profile.has(candidate_id=candidate_id))
        )
        experience = result.scalar_one_or_none()

        if experience is None:
            raise ProfileExperienceNotFoundException(experience_id)

        await self._db.delete(experience)
        await self._db.commit()

    # ==== Education ====

    async def create_education(self, candidate_id: int, request: CreateEducationRequest) -> ProfileEducationDTO:
        result = await self._db.execute(
            select(Profile).where(Profile.candidate_id == candidate_id).options(selectinload(Profile.educations))
        )
        profile = result.scalar_one_or_none()

        if profile is None:
            raise ProfileNotFoundForCandidateException(candidate_id=candidate_id)

        education = ProfileEducation(
            school=request.school,
            start_date=request.start_date,
            profile=profile,
            degree=request.degree,
            field=request.field,
            end_date=request.end_date,
            description=request.description,
        )
        self._db.add(education)
        await self._db.commit()
        return ProfileEducationDTO.from_model(education)

    async def update_education(
        self, candidate_id: int, education_id: int, request: UpdateEducationRequest
    ) -> ProfileEducationDTO:
        result = await self._db.execute(
            select(ProfileEducation)
            .where(ProfileEducation.id == education_id)
            .where(ProfileEducation.profile.has(candidate_id=candidate_id))
        )
        education = result.scalar_one_or_none()

        if education is None:
            raise ProfileEducationNotFoundException(education_id)

        updates = request.model_dump(exclude_unset=True)

        if "school" in updates and request.school is not None:
            education.school = request.school
        if "degree" in updates:
            education.degree = request.degree
        if "field" in updates:
            education.field = request.field
        if "start_date" in updates and request.start_date is not None:
            education.start_date = request.start_date
        if "end_date" in updates:
            education.end_date = request.end_date
        if "description" in updates:
            education.description = request.description

        await self._db.commit()
        return ProfileEducationDTO.from_model(education)

    async def delete_education(self, candidate_id: int, education_id: int) -> None:
        result = await self._db.execute(
            select(ProfileEducation)
            .where(ProfileEducation.id == education_id)
            .where(ProfileEducation.profile.has(candidate_id=candidate_id))
        )
        education = result.scalar_one_or_none()

        if education is None:
            raise ProfileEducationNotFoundException(education_id)

        await self._db.delete(education)
        await self._db.commit()

    # ==== Project ====

    async def create_project(self, candidate_id: int, request: CreateProjectRequest) -> ProfileProjectDTO:
        result = await self._db.execute(
            select(Profile).where(Profile.candidate_id == candidate_id).options(selectinload(Profile.projects))
        )
        profile = result.scalar_one_or_none()

        if profile is None:
            raise ProfileNotFoundForCandidateException(candidate_id=candidate_id)

        project = ProfileProject(
            name=request.name,
            profile=profile,
            description=request.description,
            url=str(request.url) if request.url is not None else None,
        )
        self._db.add(project)
        await self._db.commit()
        return ProfileProjectDTO.from_model(project)

    async def update_project(
        self, candidate_id: int, project_id: int, request: UpdateProjectRequest
    ) -> ProfileProjectDTO:
        result = await self._db.execute(
            select(ProfileProject)
            .where(ProfileProject.id == project_id)
            .where(ProfileProject.profile.has(candidate_id=candidate_id))
        )
        project = result.scalar_one_or_none()

        if project is None:
            raise ProfileProjectNotFoundException(project_id)

        updates = request.model_dump(exclude_unset=True)

        if "name" in updates and request.name is not None:
            project.name = request.name
        if "description" in updates:
            project.description = request.description
        if "url" in updates:
            project.url = str(request.url) if request.url is not None else None

        await self._db.commit()
        return ProfileProjectDTO.from_model(project)

    async def delete_project(self, candidate_id: int, project_id: int) -> None:
        result = await self._db.execute(
            select(ProfileProject)
            .where(ProfileProject.id == project_id)
            .where(ProfileProject.profile.has(candidate_id=candidate_id))
        )
        project = result.scalar_one_or_none()

        if project is None:
            raise ProfileProjectNotFoundException(project_id)

        await self._db.delete(project)
        await self._db.commit()

    # ==== Skill ====

    async def create_skill(self, candidate_id: int, request: CreateSkillRequest) -> ProfileSkillDTO:
        result = await self._db.execute(
            select(Profile).where(Profile.candidate_id == candidate_id).options(selectinload(Profile.skills))
        )
        profile = result.scalar_one_or_none()

        if profile is None:
            raise ProfileNotFoundForCandidateException(candidate_id=candidate_id)

        skill = ProfileSkill(name=request.name, profile=profile)
        self._db.add(skill)
        await self._db.commit()
        return ProfileSkillDTO.from_model(skill)

    async def update_skill(self, candidate_id: int, skill_id: int, request: UpdateSkillRequest) -> ProfileSkillDTO:
        result = await self._db.execute(
            select(ProfileSkill)
            .where(ProfileSkill.id == skill_id)
            .where(ProfileSkill.profile.has(candidate_id=candidate_id))
        )
        skill = result.scalar_one_or_none()

        if skill is None:
            raise ProfileSkillNotFoundException(skill_id)

        updates = request.model_dump(exclude_unset=True)

        if "name" in updates and request.name is not None:
            skill.name = request.name

        await self._db.commit()
        return ProfileSkillDTO.from_model(skill)

    async def delete_skill(self, candidate_id: int, skill_id: int) -> None:
        result = await self._db.execute(
            select(ProfileSkill)
            .where(ProfileSkill.id == skill_id)
            .where(ProfileSkill.profile.has(candidate_id=candidate_id))
        )
        skill = result.scalar_one_or_none()

        if skill is None:
            raise ProfileSkillNotFoundException(skill_id)

        await self._db.delete(skill)
        await self._db.commit()

    # ==== Certification ====

    async def create_certification(
        self, candidate_id: int, request: CreateCertificationRequest
    ) -> ProfileCertificationDTO:
        result = await self._db.execute(
            select(Profile).where(Profile.candidate_id == candidate_id).options(selectinload(Profile.certifications))
        )
        profile = result.scalar_one_or_none()

        if profile is None:
            raise ProfileNotFoundForCandidateException(candidate_id=candidate_id)

        cert = ProfileCertification(
            name=request.name,
            profile=profile,
            issuer=request.issuer,
            date_issued=request.date,
        )
        self._db.add(cert)
        await self._db.commit()
        return ProfileCertificationDTO.from_model(cert)

    async def update_certification(
        self, candidate_id: int, certification_id: int, request: UpdateCertificationRequest
    ) -> ProfileCertificationDTO:
        result = await self._db.execute(
            select(ProfileCertification)
            .where(ProfileCertification.id == certification_id)
            .where(ProfileCertification.profile.has(candidate_id=candidate_id))
        )
        cert = result.scalar_one_or_none()

        if cert is None:
            raise ProfileCertificationNotFoundException(certification_id)

        updates = request.model_dump(exclude_unset=True)

        if "name" in updates and request.name is not None:
            cert.name = request.name
        if "issuer" in updates:
            cert.issuer = request.issuer
        if "date" in updates:
            cert.date_issued = request.date

        await self._db.commit()
        return ProfileCertificationDTO.from_model(cert)

    async def delete_certification(self, candidate_id: int, certification_id: int) -> None:
        result = await self._db.execute(
            select(ProfileCertification)
            .where(ProfileCertification.id == certification_id)
            .where(ProfileCertification.profile.has(candidate_id=candidate_id))
        )
        cert = result.scalar_one_or_none()

        if cert is None:
            raise ProfileCertificationNotFoundException(certification_id)

        await self._db.delete(cert)
        await self._db.commit()

    # ==== Link ====

    async def create_link(self, candidate_id: int, request: CreateLinkRequest) -> ProfileLinkDTO:
        result = await self._db.execute(
            select(Profile).where(Profile.candidate_id == candidate_id).options(selectinload(Profile.links))
        )
        profile = result.scalar_one_or_none()

        if profile is None:
            raise ProfileNotFoundForCandidateException(candidate_id=candidate_id)

        link = ProfileLink(label=request.label, url=str(request.url), profile=profile)
        self._db.add(link)
        await self._db.commit()
        return ProfileLinkDTO.from_model(link)

    async def update_link(self, candidate_id: int, link_id: int, request: UpdateLinkRequest) -> ProfileLinkDTO:
        result = await self._db.execute(
            select(ProfileLink)
            .where(ProfileLink.id == link_id)
            .where(ProfileLink.profile.has(candidate_id=candidate_id))
        )
        link = result.scalar_one_or_none()

        if link is None:
            raise ProfileLinkNotFoundException(link_id)

        updates = request.model_dump(exclude_unset=True)

        if "label" in updates and request.label is not None:
            link.label = request.label
        if "url" in updates and request.url is not None:
            link.url = str(request.url)

        await self._db.commit()
        return ProfileLinkDTO.from_model(link)

    async def delete_link(self, candidate_id: int, link_id: int) -> None:
        result = await self._db.execute(
            select(ProfileLink)
            .where(ProfileLink.id == link_id)
            .where(ProfileLink.profile.has(candidate_id=candidate_id))
        )
        link = result.scalar_one_or_none()

        if link is None:
            raise ProfileLinkNotFoundException(link_id)

        await self._db.delete(link)
        await self._db.commit()
