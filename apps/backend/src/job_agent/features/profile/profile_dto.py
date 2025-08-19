from __future__ import annotations

from datetime import date, datetime
from typing import Optional, List

# TODO: Replace URL 'str' with `HttpUrl`, didn't for now because openAI text_format doesn't support it but that is just a workaround
from pydantic import BaseModel, EmailStr, Field

from job_agent.features.profile.profile_model import (
    Profile,
    ProfileExperience,
    ProfileEducation,
    ProfileProject,
    ProfileSkill,
    ProfileCertification,
    ProfileLink,
)

# ============================
# DTOs
# ============================


class ProfileDTO(BaseModel):
    id: int
    first_name: str
    last_name: str
    contact_email: str
    contact_phone: Optional[str]
    work_location: Optional[str]
    summary: Optional[str]

    created_at: datetime
    updated_at: datetime

    experiences: List["ProfileExperienceDTO"] = []
    educations: List["ProfileEducationDTO"] = []
    projects: List["ProfileProjectDTO"] = []
    skills: List["ProfileSkillDTO"] = []
    certifications: List["ProfileCertificationDTO"] = []
    links: List["ProfileLinkDTO"] = []

    @classmethod
    def from_model(cls, model: Profile) -> "ProfileDTO":
        return cls(
            id=model.id,
            first_name=model.first_name,
            last_name=model.last_name,
            contact_email=model.contact_email,
            contact_phone=model.contact_phone,
            work_location=model.work_location,
            summary=model.summary,
            created_at=model.created_at,
            updated_at=model.updated_at,
            experiences=[ProfileExperienceDTO.from_model(e) for e in (model.experiences or [])],
            educations=[ProfileEducationDTO.from_model(e) for e in (model.educations or [])],
            projects=[ProfileProjectDTO.from_model(p) for p in (model.projects or [])],
            skills=[ProfileSkillDTO.from_model(s) for s in (model.skills or [])],
            certifications=[ProfileCertificationDTO.from_model(c) for c in (model.certifications or [])],
            links=[ProfileLinkDTO.from_model(l) for l in (model.links or [])],
        )


class ProfileExperienceDTO(BaseModel):
    id: int
    company: str
    title: str
    description: str
    start_date: date
    end_date: Optional[date]
    is_current: bool

    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, model: ProfileExperience) -> "ProfileExperienceDTO":
        return cls(
            id=model.id,
            company=model.company,
            title=model.title,
            description=model.description,
            start_date=model.start_date,
            end_date=model.end_date,
            is_current=model.is_current,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class ProfileEducationDTO(BaseModel):
    id: int
    school: str
    degree: Optional[str]
    field: Optional[str]
    start_date: date
    end_date: Optional[date]
    description: Optional[str]

    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, model: ProfileEducation) -> "ProfileEducationDTO":
        return cls(
            id=model.id,
            school=model.school,
            degree=model.degree,
            field=model.field,
            start_date=model.start_date,
            end_date=model.end_date,
            description=model.description,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class ProfileProjectDTO(BaseModel):
    id: int
    name: str
    description: str
    url: Optional[str]

    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, model: ProfileProject) -> "ProfileProjectDTO":
        return cls(
            id=model.id,
            name=model.name,
            description=model.description,
            url=model.url,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class ProfileSkillDTO(BaseModel):
    id: int
    name: str

    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, model: ProfileSkill) -> "ProfileSkillDTO":
        return cls(
            id=model.id,
            name=model.name,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class ProfileCertificationDTO(BaseModel):
    id: int
    name: str
    issuer: Optional[str]
    date_issued: Optional[date]

    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, model: ProfileCertification) -> "ProfileCertificationDTO":
        return cls(
            id=model.id,
            name=model.name,
            issuer=model.issuer,
            date_issued=model.date_issued,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class ProfileLinkDTO(BaseModel):
    id: int
    label: str
    url: str

    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, model: ProfileLink) -> "ProfileLinkDTO":
        return cls(
            id=model.id,
            label=model.label,
            url=model.url,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


# ============================
# Create Requests
# ============================


class CreateProfileRequest(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    contact_email: EmailStr
    contact_phone: str = Field(..., min_length=1)
    work_location: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = None


class CreateExperienceRequest(BaseModel):
    company: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    start_date: date
    description: Optional[str] = None
    end_date: Optional[date] = None


class CreateEducationRequest(BaseModel):
    school: str = Field(..., min_length=1)
    start_date: date
    degree: Optional[str] = None
    field: Optional[str] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class CreateProjectRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    url: Optional[str] = None


class CreateSkillRequest(BaseModel):
    name: str = Field(..., min_length=1)


class CreateCertificationRequest(BaseModel):
    name: str = Field(..., min_length=1)
    issuer: Optional[str] = None
    date: Optional[date] = None


class CreateLinkRequest(BaseModel):
    label: str = Field(..., min_length=1)
    url: str


# ============================
# Update Requests
# ============================


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1)
    last_name: Optional[str] = Field(None, min_length=1)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, min_length=1)
    work_location: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = None


class UpdateExperienceRequest(BaseModel):
    company: Optional[str] = Field(None, min_length=1)
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class UpdateEducationRequest(BaseModel):
    school: Optional[str] = Field(None, min_length=1)
    degree: Optional[str] = None
    field: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class UpdateProjectRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    url: Optional[str] = None


class UpdateSkillRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1)


class UpdateCertificationRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    issuer: Optional[str] = None
    date: Optional[date] = None


class UpdateLinkRequest(BaseModel):
    label: Optional[str] = Field(None, min_length=1)
    url: Optional[str] = None
