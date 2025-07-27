from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional, List

from sqlalchemy import String, DateTime, Enum as SqlEnum, ForeignKey, Text

from sqlalchemy.orm import (
    relationship,
    Mapped,
    mapped_column,
    synonym,
    DeclarativeBase,
)


class Base(DeclarativeBase):
    pass


# Note I'm using properties/setters and synonyms, I'm aware hybrid properties exist, but they SUCK


class Candidate(Base):
    __tablename__ = "candidate"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    socials: Mapped[List[CandidateSocialLink]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan"
    )
    resumes: Mapped[List[Resume]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan"
    )
    cover_letters: Mapped[List[CoverLetter]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan"
    )
    applications: Mapped[List[JobApplication]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan"
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

    def __init__(
        self,
        first_name: str,
        last_name: str,
        phone: str,
        email: str,
        hashed_password: str,
    ) -> None:
        super().__init__()

        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
        self.email = email
        self.hashed_password = hashed_password

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class CandidateSocialLink(Base):
    __tablename__ = "candidate_social_link"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    _link: Mapped[str] = mapped_column(String(100), nullable=False)

    candidate_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("candidate.id"), nullable=False
    )
    candidate: Mapped[Candidate] = relationship(back_populates="socials")

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

    def __init__(self, name: str, link: str, candidate: Candidate) -> None:
        super().__init__()

        self.name = name
        self._link = link
        self.candidate = candidate

    def _update(self):
        self.updated_at = datetime.utcnow()

    @property
    def link(self) -> str:
        return self._link

    @link.setter
    def link(self, link: str) -> None:
        self._link = link
        self._update()

    link = synonym(name="_link", descriptor=link)  # type: ignore


class Resume(Base):
    __tablename__ = "resume"

    id: Mapped[int] = mapped_column(primary_key=True)
    _name: Mapped[str] = mapped_column(String(50), nullable=False)
    text_content: Mapped[str] = mapped_column(Text, nullable=False)

    stored_file_id: Mapped[int] = mapped_column(ForeignKey("stored_file.id"), nullable=False)
    stored_file: Mapped[StoredFile] = relationship()

    candidate_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("candidate.id"), nullable=False
    )
    candidate: Mapped[Candidate] = relationship(back_populates="resumes")

    applications_used_for: Mapped[List[JobApplication]] = relationship(
        back_populates="used_resume"
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

    def __init__(self, name: str, stored_file: "StoredFile", text_content: str, candidate: Candidate):
        super().__init__()

        self._name = name
        self.text_content = text_content
        self.candidate = candidate
        self.stored_file = stored_file


    def _update(self):
        self.updated_at = datetime.utcnow()

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, new_name: str):
        self._name = new_name
        self._update()

    name = synonym("_name", descriptor=name)  # type: ignore


class CoverLetter(Base):
    __tablename__ = "cover_letter"

    id: Mapped[int] = mapped_column(primary_key=True)
    _name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    key: Mapped[str] = mapped_column(String(100), nullable=False)

    candidate_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("candidate.id"), nullable=False
    )
    candidate: Mapped[Candidate] = relationship(back_populates="cover_letters")

    applications_used_for: Mapped[List[JobApplication]] = relationship(
        back_populates="used_cover_letter"
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

    def __init__(self, name: str, key: str, candidate: Candidate):
        super().__init__()
        self._name = name
        self.key = key
        self.candidate = candidate

    def _update(self):
        self.updated_at = datetime.utcnow()

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, new_name: str):
        self._name = new_name
        self._update()

    name = synonym("_name", descriptor=name)  # type: ignore


class JobListing(Base):
    __tablename__ = "job_listing"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    company: Mapped[str] = mapped_column(String(500), nullable=False)
    application_url: Mapped[str] = mapped_column(String(500), nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    posted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    scraped_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

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

    candidate_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("candidate.id"), nullable=False
    )
    candidate: Mapped[Candidate] = relationship(back_populates="applications")

    job_listing_id: Mapped[Optional[int]] = mapped_column(ForeignKey("job_listing.id"))
    job_listing: Mapped[JobListing] = relationship()

    used_resume_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("resume.id"), nullable=True
    )
    used_resume: Mapped[Optional[Resume]] = relationship(
        back_populates="applications_used_for"
    )

    used_cover_letter_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("cover_letter.id"), nullable=True
    )
    used_cover_letter: Mapped[Optional[CoverLetter]] = relationship(
        back_populates="applications_used_for"
    )

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


class StoredFile(Base):
    __tablename__ = "stored_file"
    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    bucket: Mapped[str] = mapped_column(String(100), nullable=False)
    content_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    def __init__(self, key: str, bucket: str, content_type: Optional[str] = None):
        super().__init__()
        self.key = key
        self.bucket = bucket
        self.content_type = content_type