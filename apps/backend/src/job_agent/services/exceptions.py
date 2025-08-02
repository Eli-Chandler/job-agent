from typing import Optional

from fastapi import HTTPException
from pydantic import HttpUrl
from starlette.status import (
    HTTP_404_NOT_FOUND,
    HTTP_401_UNAUTHORIZED,
    HTTP_409_CONFLICT,
)

# ===
# 400
# ===


class UnsupportedJobUrlException(HTTPException):
    def __init__(self, job_url: HttpUrl | str):
        super().__init__(
            status_code=400,
            detail=f"Job URL {job_url} not supported. Currently only support https:///hiring.cafe/job/<id> links (share + copy link)",
        )


class InvalidResumeFileTypeException(HTTPException):
    def __init__(self, content_type: str):
        super().__init__(
            status_code=400,
            detail=f"Invalid resume file type '{content_type}'. Only application/pdf is supported.",
        )


# ===
# 401
# ===


class WrongCredentialsException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ===
# 404
# ===


class EntityWithIdNotFoundException(HTTPException):
    def __init__(self, entity_type: str, entity_id: Optional[str | int]):
        message = f"{entity_type} not found"
        if entity_id:
            message = f"{entity_type} with id {entity_id} not found"
        super().__init__(status_code=HTTP_404_NOT_FOUND, detail=message)


class CandidateNotFoundException(HTTPException):
    def __init__(
        self, candidate_id: Optional[int] = None, candidate_email: Optional[str] = None
    ):
        message = "Candidate not found"
        if candidate_id is not None:
            message = f"Candidate with id {candidate_id} not found"
        elif candidate_email is not None:
            message = f"Candidate with email {candidate_email} not found"

        super().__init__(status_code=HTTP_404_NOT_FOUND, detail=message)
        self.candidate_id = candidate_id


class JobListingNotFoundException(EntityWithIdNotFoundException):
    def __init__(self, job_listing_id: Optional[int] = None):
        super().__init__("Job listing", job_listing_id)


class ResumeNotFoundException(EntityWithIdNotFoundException):
    def __init__(self, resume_id: Optional[int] = None):
        super().__init__("Resume", resume_id)


class CoverLetterNotFoundException(EntityWithIdNotFoundException):
    def __init__(self, cover_letter_id: Optional[int] = None):
        super().__init__("Cover letter", cover_letter_id)


class SocialLinkNotFoundException(HTTPException):
    def __init__(
        self,
        social_id: Optional[int] = None,
        social_name: Optional[str] = None,
        candidate_id: Optional[int] = None,
    ):
        message = "Social link not found"

        if social_id is not None:
            message = f"Social link with id {social_id} not found"
        elif social_name is not None:
            message = f"Social link with name {social_name} not found"

        if candidate_id is not None:
            message += f"for candidate with id {candidate_id}"

        super().__init__(status_code=HTTP_404_NOT_FOUND, detail=message)


# ===
# 409
# ===


class CandidateEmailConflictException(HTTPException):
    def __init__(self):
        super().__init__(status_code=HTTP_409_CONFLICT, detail="Email already in use")


class ResumeNameConflictException(HTTPException):
    def __init__(self, name: Optional[str] = None):
        message = "You already have a resume with this name"
        if name is not None:
            message = f"You already have a resume with name {name}"

        super().__init__(status_code=HTTP_409_CONFLICT, detail=message)
