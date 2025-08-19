from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import String, Text, DateTime, Enum as SqlEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from job_agent.features.common.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from job_agent.features.candidate.candidate_model import Candidate, CoverLetter, Resume


class JobListing(Base):
    __tablename__ = "job_listing"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    company: Mapped[str] = mapped_column(String(500), nullable=False)
    application_url: Mapped[str] = mapped_column(String(500), nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    posted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    scraped_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    # I don't think this is needed
    # applications: Mapped[List[JobApplication]] = relationship(back_populates="job_listing")

    def __init__(
        self,
        title: str,
        company: str,
        application_url: str,
        description: Optional[str] = None,
        source: Optional[str] = None,
        posted_at: Optional[datetime] = None,
        scraped_at: Optional[datetime] = None,
    ):
        super().__init__()
        self.title = title
        self.company = company
        self.application_url = application_url
        self.description = description
        self.source = source
        self.posted_at = posted_at
        if scraped_at is not None:
            self.scraped_at = scraped_at


class JobApplicationStatus(str, Enum):
    PENDING = "pending"
    APPLYING = "applying"
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    REJECTED = "rejected"
    OFFERED = "offered"


class JobApplication(Base):
    __tablename__ = "job_application"

    id: Mapped[int] = mapped_column(primary_key=True)
    _application_status: Mapped[JobApplicationStatus] = mapped_column(
        SqlEnum(JobApplicationStatus), default=JobApplicationStatus.PENDING
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    candidate_id: Mapped[Optional[int]] = mapped_column(ForeignKey("candidate.id"), nullable=False)
    candidate: Mapped[Candidate] = relationship(back_populates="applications")

    job_listing_id: Mapped[Optional[int]] = mapped_column(ForeignKey("job_listing.id"))
    job_listing: Mapped[JobListing] = relationship()

    used_resume_id: Mapped[Optional[int]] = mapped_column(ForeignKey("resume.id"), nullable=True)
    used_resume: Mapped[Optional[Resume]] = relationship(back_populates="applications_used_for")

    used_cover_letter_id: Mapped[Optional[int]] = mapped_column(ForeignKey("cover_letter.id"), nullable=True)
    used_cover_letter: Mapped[Optional[CoverLetter]] = relationship(back_populates="applications_used_for")

    def __init__(
        self,
        candidate: Candidate,
        job_listing: JobListing,
        used_resume: Optional[Resume] = None,
        used_cover_letter: Optional[CoverLetter] = None,
        notes: Optional[str] = None,
    ):
        super().__init__()
        self.candidate = candidate
        self.job_listing = job_listing
        self.used_resume = used_resume
        self.used_cover_letter = used_cover_letter
        self.notes = notes

    def _update(self):
        self.updated_at = datetime.utcnow()

    @property
    def application_status(self):
        return self._application_status

    @application_status.setter
    def application_status(self, new_application_status: JobApplicationStatus):
        self._application_status = new_application_status
        self._update()

    application_status = synonym("_application_status", descriptor=application_status)  # type: ignore
