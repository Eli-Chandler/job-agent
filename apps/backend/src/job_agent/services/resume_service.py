import asyncio
from io import BytesIO

from pypdf import PdfReader
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from job_agent.models import Candidate, Resume
from job_agent.services.exceptions import (
    InvalidResumeFileTypeException,
    CandidateNotFoundException,
    ResumeNameConflictException,
    ResumeNotFoundException,
)
from job_agent.services.s3_file_uploader import S3FileUploader
from job_agent.services.schemas import UploadResumeRequest, ResumeDTO, PresignedUrlDTO


class ResumeService:
    def __init__(self, db: AsyncSession, s3_file_uploader: S3FileUploader):
        self._db = db
        self._s3_file_uploader = s3_file_uploader

    async def upload_resume(
        self, candidate_id: int, request: UploadResumeRequest
    ) -> ResumeDTO:
        if request.file.content_type != "application/pdf":
            raise InvalidResumeFileTypeException(request.file.content_type)

        query = (
            select(Candidate)
            .where(Candidate.id == candidate_id)
            .options(selectinload(Candidate.resumes))
        )
        result = await self._db.execute(query)
        candidate: Candidate | None = result.scalar_one_or_none()

        if candidate is None:
            raise CandidateNotFoundException(candidate_id=candidate_id)

        if any(resume.name == request.name for resume in candidate.resumes):
            raise ResumeNameConflictException(request.name)

        stored_file = await self._s3_file_uploader.upload(request.file)

        resume = Resume(
            name=request.name,
            stored_file=stored_file,
            text_content=await _extract_text_content_from_pdf(request.file.data),
            candidate=candidate,
        )

        self._db.add(resume)
        await self._db.commit()

        return ResumeDTO.from_model(resume)

    async def get_resumes_by_candidate_id(self, candidate_id: int):
        query = select(Resume).where(Resume.candidate_id == candidate_id)
        result = await self._db.execute(query)
        resumes = result.scalars().all()
        return [ResumeDTO.from_model(resume) for resume in resumes]

    async def get_resume_presigned_url(
        self, candidate_id: int, resume_id: int
    ) -> PresignedUrlDTO:
        result = await self._db.execute(
            select(Resume)
            .where(Resume.candidate_id == candidate_id)
            .where(Resume.id == resume_id)
            .options(selectinload(Resume.stored_file))
        )
        resume: Resume | None = result.scalar_one_or_none()

        if resume is None:
            raise ResumeNotFoundException(resume_id)

        return await self._s3_file_uploader.generate_presigned_url(resume.stored_file)

    async def delete_resume(self, candidate_id: int, resume_id: int) -> None:
        result = await self._db.execute(
            select(Resume)
            .where(Resume.candidate_id == candidate_id)
            .where(Resume.id == resume_id)
            .options(selectinload(Resume.stored_file))
        )
        resume: Resume | None = result.scalar_one_or_none()

        if resume is None:
            raise ResumeNotFoundException(resume_id)

        await self._db.delete(resume)
        await self._db.commit()


async def _extract_text_content_from_pdf(pdf: bytes):
    def read() -> str:
        reader = PdfReader(stream=BytesIO(pdf))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    return await asyncio.to_thread(read)
