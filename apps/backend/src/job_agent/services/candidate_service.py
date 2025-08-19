from typing import Optional

from pydantic import EmailStr

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import bcrypt

from job_agent.features.candidate.candidate_model import Candidate
from job_agent.services.exceptions import (
    CandidateNotFoundException,
    WrongCredentialsException,
    CandidateEmailConflictException,
)
from job_agent.services.s3_file_uploader import S3FileUploader
from job_agent.services.schemas import (
    CreateCandidateRequest,
    CandidateLoginRequest,
    CandidateDTO,
)


class CandidateService:
    def __init__(self, db: AsyncSession, s3_file_uploader: S3FileUploader):
        self._db = db
        self._s3_file_uploader = s3_file_uploader

    async def _get_candidate_by_email(self, email: str | EmailStr) -> Optional[Candidate]:
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

    async def get_user_by_email_and_password(self, request: CandidateLoginRequest) -> CandidateDTO:
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
            email=str(request.email),
            hashed_password=_hash_password(request.password),
        )

        self._db.add(candidate)
        await self._db.commit()
        return CandidateDTO.from_model(candidate)


def _hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def _verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
