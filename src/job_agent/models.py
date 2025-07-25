from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional, List

from sqlalchemy import String, DateTime, Enum as SqlEnum, ForeignKey, Text

from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column, synonym

Base = declarative_base()

# Note I'm using properties/setters and synonyms, I'm aware hybrid properties exist, but they SUCK

class Candidate(Base):
    __tablename__ = "candidate"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    socials: Mapped[List[CandidateSocialLink]] = relationship(back_populates="candidate", cascade="all, delete-orphan")
    resumes: Mapped[List[Resume]] = relationship(back_populates="candidate", cascade="all, delete-orphan")
    cover_letters: Mapped[List[CoverLetter]] = relationship(back_populates="candidate", cascade="all, delete-orphan")
    applications: Mapped[List[JobApplication]] = relationship(back_populates="candidate", cascade="all, delete-orphan")

    created_at: Mapped[datetime] = mapped_column(default_factory=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default_factory=datetime.utcnow)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class CandidateSocialLink(Base):
    __tablename__ = "candidate_social_link"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    link: Mapped[str] = mapped_column(String(100), nullable=False)

    candidate_id: Mapped[Optional[int]] = mapped_column(ForeignKey("candidate.id"), nullable=True)
    candidate: Mapped[Candidate] = relationship(back_populates="socials")


class Resume(Base):
    __tablename__ = "resume"

    id: Mapped[int] = mapped_column(primary_key=True)
    _name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    key: Mapped[str] = mapped_column(String(100), nullable=False)

    candidate_id: Mapped[Optional[int]] = mapped_column(ForeignKey("candidate.id"), nullable=True)
    candidate: Mapped[Candidate] = relationship(back_populates="resumes")

    applications_used_for: Mapped[List[JobApplication]] = relationship(back_populates="used_resume")

    created_at: Mapped[datetime] = mapped_column(default_factory=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default_factory=datetime.utcnow)

    def _update(self):
        self.updated_at = datetime.utcnow()

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, new_name: str):
        self._name = new_name
        self._update()

    name = synonym('_name', descriptor=name)


class CoverLetter(Base):
    __tablename__ = "cover_letter"

    id: Mapped[int] = mapped_column(primary_key=True)
    _name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    key: Mapped[str] = mapped_column(String(100), nullable=False)

    candidate_id: Mapped[Optional[int]] = mapped_column(ForeignKey("candidate.id"), nullable=True)
    candidate: Mapped[Candidate] = relationship(back_populates="cover_letters")

    applications_used_for: Mapped[List[JobApplication]] = relationship(back_populates="used_cover_letter")

    created_at: Mapped[datetime] = mapped_column(default_factory=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default_factory=datetime.utcnow)

    def _update(self):
        self.updated_at = datetime.utcnow()

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, new_name: str):
        self._name = new_name
        self._update()

    name = synonym('_name', descriptor=name)


class JobListing(Base):
    __tablename__ = "job_listing"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    company: Mapped[str] = mapped_column(String(500), nullable=False)
    application_url: Mapped[str] = mapped_column(String(500), nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    posted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    scraped_at: Mapped[datetime] = mapped_column(default_factory=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default_factory=datetime.utcnow)


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
    _application_status: Mapped[JobApplicationStatus] = mapped_column(SqlEnum(JobApplicationStatus), default=JobApplicationStatus.PENDING)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    candidate_id: Mapped[Optional[int]] = mapped_column(ForeignKey("candidate.id"), nullable=True)
    candidate: Mapped[Candidate] = relationship(back_populates="applications")

    used_resume_id: Mapped[Optional[int]] = mapped_column(ForeignKey("resume.id"), nullable=True)
    used_resume: Mapped[Optional[Resume]] = relationship(back_populates="applications_used_for")

    used_cover_letter_id: Mapped[Optional[int]] = mapped_column(ForeignKey("cover_letter.id"), nullable=True)
    used_cover_letter: Mapped[Optional[CoverLetter]] = relationship(back_populates="applications_used_for")

    def _update(self):
        self.updated_at = datetime.utcnow()

    @property
    def application_status(self):
        return self._application_status

    @application_status.setter
    def application_status(self, new_application_status: JobApplicationStatus):
        self._application_status = new_application_status
        self._update()

    application_status = synonym('_application_status', descriptor=application_status)