import asyncio
import uuid
from typing import Optional

from io import BytesIO

import pytest
import pytest_asyncio
from pydantic import EmailStr

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from job_agent.models import Candidate, CandidateSocialLink, Resume
import bcrypt

from job_agent.services.exceptions import (
    CandidateNotFoundException,
    WrongCredentialsException,
    CandidateEmailConflictException,
    SocialLinkNotFoundException,
    ResumeNameConflictException,
    InvalidResumeFileTypeException,
)
from job_agent.services.s3_file_uploader import S3FileUploader
from job_agent.services.schemas import (
    CreateCandidateRequest,
    CandidateLoginRequest,
    AddOrUpdateSocialRequest,
    CandidateDTO,
    CandidateSocialLinkDTO,
    UploadResumeRequest,
    ResumeDTO,
    UpdateCandidatePersonalInfoRequest,
)

from PyPDF2 import PdfReader


class CandidateService:
    def __init__(self, db: AsyncSession, s3_file_uploader: S3FileUploader):
        self._db = db
        self._s3_file_uploader = s3_file_uploader

    async def _get_candidate_by_email(
        self, email: str | EmailStr
    ) -> Optional[Candidate]:
        query = select(Candidate).where(Candidate.email == str(email))
        result = await self._db.execute(query)
        return result.scalar_one_or_none()

    async def _get_candidate_by_id(self, candidate_id: int) -> Optional[Candidate]:
        query = select(Candidate).where(Candidate.id == candidate_id)
        result = await self._db.execute(query)
        return result.scalar_one_or_none()

    async def get_candidate_by_id(self, candidate_id: int) -> CandidateDTO:
        candidate = await self._get_candidate_by_id(candidate_id)

        if candidate is None:
            raise CandidateNotFoundException(candidate_id=candidate_id)

        return CandidateDTO.from_model(candidate)

    async def get_user_by_email_and_password(
        self, request: CandidateLoginRequest
    ) -> CandidateDTO:
        candidate = await self._get_candidate_by_email(request.email)

        if candidate is None:
            raise WrongCredentialsException()

        if not _verify_password(request.password, candidate.hashed_password):
            raise WrongCredentialsException()

        return CandidateDTO.from_model(candidate)

    async def create_user(self, request: CreateCandidateRequest) -> CandidateDTO:
        existing_candidate = await self._get_candidate_by_email(request.email)

        if existing_candidate is not None:
            raise CandidateEmailConflictException()

        candidate = Candidate(
            first_name=request.first_name,
            last_name=request.last_name,
            phone=request.phone,
            email=str(request.email),
            hashed_password=_hash_password(request.password),
        )

        self._db.add(candidate)
        await self._db.commit()
        # await self._db.refresh(candidate)
        return CandidateDTO.from_model(candidate)

    async def add_or_update_social_link(
        self, candidate_id: int, request: AddOrUpdateSocialRequest
    ) -> CandidateSocialLinkDTO:
        query = (
            select(Candidate)
            .where(Candidate.id == candidate_id)
            .options(selectinload(Candidate.socials))
        )
        result = await self._db.execute(query)
        candidate = result.scalar_one_or_none()

        if candidate is None:
            raise CandidateNotFoundException(candidate_id=candidate_id)

        social = next(
            (social for social in candidate.socials if social.name == request.name),
            None,
        )

        if social is not None:
            social.link = str(request.link)
            await self._db.commit()
        else:
            social = CandidateSocialLink(
                name=request.name, link=str(request.link), candidate=candidate
            )
            self._db.add(social)
            await self._db.commit()
            # await self._db.refresh(social)

        return CandidateSocialLinkDTO.from_model(social)

    async def delete_social_link(self, candidate_id: int, social_id: int) -> None:
        query = (
            select(CandidateSocialLink)
            .where(CandidateSocialLink.candidate_id == candidate_id)
            .where(CandidateSocialLink.id == social_id)
        )
        result = await self._db.execute(query)
        social: CandidateSocialLink | None = result.scalar_one_or_none()

        if social is None:
            raise SocialLinkNotFoundException(
                social_id=social_id, candidate_id=candidate_id
            )

        await self._db.delete(social)
        await self._db.commit()

    async def update_candidate_personal_info(
        self, candidate_id: int, request: UpdateCandidatePersonalInfoRequest
    ) -> CandidateDTO:
        candidate = await self._get_candidate_by_id(candidate_id)
        if candidate is None:
            raise CandidateNotFoundException(candidate_id=candidate_id)

        if request.first_name is not None:
            candidate.first_name = request.first_name

        if request.last_name is not None:
            candidate.last_name = request.last_name

        if request.phone is not None:
            candidate.phone = request.phone

        await self._db.commit()
        return CandidateDTO.from_model(candidate)

    async def get_candidate_socials(
        self, candidate_id: int
    ) -> list[CandidateSocialLinkDTO]:
        query = select(CandidateSocialLink).where(
            CandidateSocialLink.candidate_id == candidate_id
        )
        result = await self._db.execute(query)
        socials = result.scalars().all()
        return [CandidateSocialLinkDTO.from_model(social) for social in socials]


def _hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def _verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )
