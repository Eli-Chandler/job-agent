from datetime import datetime
from io import BytesIO
from typing import Optional

from pydantic import BaseModel, EmailStr, HttpUrl

from job_agent.models import Candidate, CandidateSocialLink, Resume, CoverLetter, JobApplication, JobListing


class CreateCandidateRequest(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    password: str


class CandidateLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AddOrUpdateSocialRequest(BaseModel):
    name: str
    link: HttpUrl


class CandidateDTO(BaseModel):
    id: int
    first_name: str
    last_name: str
    full_name: str
    phone: str
    email: str
    # socials: list["CandidateSocialLinkDTO"]
    # resumes: list["ResumeDTO"]
    # cover_letters: list["CoverLetterDTO"]

    @classmethod
    def from_model(cls, model: Candidate) -> "CandidateDTO":
        return cls(
            id=model.id,
            first_name=model.first_name,
            last_name=model.last_name,
            full_name=model.full_name,
            phone=model.phone,
            email=model.email,
        )


class CandidateSocialLinkDTO(BaseModel):
    id: int
    name: str
    link: str

    @classmethod
    def from_model(cls, model: CandidateSocialLink) -> "CandidateSocialLinkDTO":
        return cls(
            id=model.id,
            name=model.name,
            link=model.link,
        )


class ResumeDTO(BaseModel):
    id: int
    name: str

    @classmethod
    def from_model(cls, model: Resume) -> "ResumeDTO":
        return cls(
            id=model.id,
            name=model.name,
        )


class CoverLetterDTO(BaseModel):
    id: int
    name: str
    key: str

    @classmethod
    def from_model(cls, model: CoverLetter) -> "CoverLetterDTO":
        return cls(
            id=model.id,
            name=model.name,
            key=model.key,
        )


class CreateJobApplicationRequest(BaseModel):
    job_listing_id: int
    resume_id: int
    cover_letter_id: Optional[int] = None


class JobApplicationDTO(BaseModel):
    id: int
    job_listing: "JobListingDTO"
    used_resume: Optional[ResumeDTO]
    used_cover_letter: Optional[CoverLetterDTO]
    notes: Optional[str]

    @classmethod
    def from_model(cls, job_application: JobApplication):
        return cls(
            id=job_application.id,
            job_listing=JobListingDTO.from_model(job_application.job_listing),
            used_resume=ResumeDTO.from_model(job_application.used_resume)
            if job_application.used_resume
            else None,
            used_cover_letter=CoverLetterDTO.from_model(
                job_application.used_cover_letter
            )
            if job_application.used_cover_letter
            else None,
            notes=job_application.notes,
        )


class JobListingDTO(BaseModel):
    id: int
    title: str
    application_url: str
    source: Optional[str]
    description: Optional[str]
    posted_at: Optional[datetime]
    scraped_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, job_listing: JobListing):
        return cls(
            id=job_listing.id,
            title=job_listing.title,
            application_url=job_listing.application_url,
            source=job_listing.source,
            description=job_listing.description,
            posted_at=job_listing.posted_at,
            scraped_at=job_listing.scraped_at,
            updated_at=job_listing.updated_at,
        )


class ScrapeJobListingRequest(BaseModel):
    job_url: HttpUrl


class FileContent(BaseModel):
    data: bytes
    content_type: str


class UploadResumeRequest(BaseModel):
    name: str
    file: FileContent
