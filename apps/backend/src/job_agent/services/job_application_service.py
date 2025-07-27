from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from job_agent.models import JobApplication, Candidate, JobListing, Resume, CoverLetter
from job_agent.services.schemas import CreateJobApplicationRequest, JobApplicationDTO
from job_agent.services.exceptions import (
    CandidateNotFoundException,
    JobListingNotFoundException,
    CoverLetterNotFoundException,
    ResumeNotFoundException,
)


class JobApplicationService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def _get_candidate_by_id(self, candidate_id: int) -> Candidate:
        query = (
            select(Candidate)
            .where(Candidate.id == candidate_id)
            .options(selectinload(Candidate.applications))
        )
        result = await self._db.execute(query)
        candidate = result.scalar_one_or_none()

        if candidate is None:
            raise CandidateNotFoundException(candidate_id)

        return candidate

    async def _get_job_listing_by_id(self, job_id: int) -> JobListing:
        query = select(JobListing).where(JobListing.id == job_id)
        result = await self._db.execute(query)
        job_listing = result.scalar_one_or_none()

        if job_listing is None:
            raise JobListingNotFoundException(job_id)

        return job_listing

    async def _get_resume(self, user_id: int, resume_id: int) -> Resume:
        query = (
            select(Resume)
            .where(Resume.id == resume_id)
            .where(Resume.candidate_id == user_id)
        )
        result = await self._db.execute(query)
        resume = result.scalar_one_or_none()

        if resume is None:
            raise ResumeNotFoundException(resume_id)

        return resume

    async def _get_cover_letter(
        self, user_id: int, cover_letter_id: int
    ) -> Optional[CoverLetter]:
        query = (
            select(CoverLetter)
            .where(CoverLetter.id == cover_letter_id)
            .where(CoverLetter.candidate_id == user_id)
        )
        result = await self._db.execute(query)
        cover_letter = result.scalar_one_or_none()

        if cover_letter is None:
            raise CoverLetterNotFoundException(cover_letter_id)

        return cover_letter

    async def create_job_application(
        self, candidate_id: int, request: CreateJobApplicationRequest
    ) -> JobApplicationDTO:
        candidate = await self._get_candidate_by_id(candidate_id)
        job_listing = await self._get_job_listing_by_id(request.job_listing_id)
        resume = (
            await self._get_resume(candidate.id, request.resume_id)
            if request.resume_id
            else None
        )
        cover_letter = (
            await self._get_cover_letter(candidate.id, request.cover_letter_id)
            if request.cover_letter_id
            else None
        )

        job_application = JobApplication(
            candidate=candidate,
            job_listing=job_listing,
            used_resume=resume,
            used_cover_letter=cover_letter,
        )

        self._db.add(job_application)
        await self._db.commit()
        # await self._db.refresh(job_application)

        return JobApplicationDTO.from_model(job_application)
