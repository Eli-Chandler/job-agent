from typing import Optional

from pydantic import BaseModel, EmailStr, HttpUrl

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from job_agent.models import Candidate, CandidateSocialLink, Resume, CoverLetter
import bcrypt

from job_agent.services.exceptions import (
    CandidateNotFoundException,
    WrongCredentialsException,
    CandidateEmailTakenException,
    SocialLinkNotFoundException,
)


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
    key: str

    @classmethod
    def from_model(cls, model: Resume) -> "ResumeDTO":
        return cls(
            id=model.id,
            name=model.name,
            key=model.key,
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


class CandidateService:
    def __init__(self, db: AsyncSession):
        self._db = db

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
            raise CandidateNotFoundException(candidate_email=str(request.email))

        if not _verify_password(request.password, candidate.hashed_password):
            raise WrongCredentialsException()

        return CandidateDTO.from_model(candidate)

    async def create_user(self, request: CreateCandidateRequest) -> CandidateDTO:
        existing_candidate = await self._get_candidate_by_email(request.email)

        if existing_candidate is not None:
            raise CandidateEmailTakenException()

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


def _hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def _verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )
