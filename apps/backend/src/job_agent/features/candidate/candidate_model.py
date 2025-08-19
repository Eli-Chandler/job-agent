from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from typing import TYPE_CHECKING

from job_agent.features.common.base import Base

if TYPE_CHECKING:
    from job_agent.features.file.file_model import StoredFile
    from job_agent.features.job.job_model import JobApplication
    from job_agent.features.profile.profile_model import Profile


class Candidate(Base):
    __tablename__ = "candidate"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(80), nullable=False)
    last_name: Mapped[str] = mapped_column(String(80), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    resumes: Mapped[List[Resume]] = relationship(back_populates="candidate", cascade="all, delete-orphan")
    cover_letters: Mapped[List[CoverLetter]] = relationship(back_populates="candidate", cascade="all, delete-orphan")
    applications: Mapped[List[JobApplication]] = relationship(back_populates="candidate", cascade="all, delete-orphan")

    profile: Mapped[Optional[Profile]] = relationship(back_populates="candidate", cascade="all, delete-orphan")

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    def __init__(
        self,
        first_name: str,
        last_name: str,
        email: str,
        hashed_password: str,
    ) -> None:
        super().__init__()

        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.hashed_password = hashed_password

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class Resume(Base):
    __tablename__ = "resume"

    id: Mapped[int] = mapped_column(primary_key=True)
    _name: Mapped[str] = mapped_column(String(50), nullable=False)
    text_content: Mapped[str] = mapped_column(Text, nullable=False)

    stored_file_id: Mapped[int] = mapped_column(ForeignKey("stored_file.id"), nullable=False)
    stored_file: Mapped[StoredFile] = relationship()

    candidate_id: Mapped[Optional[int]] = mapped_column(ForeignKey("candidate.id"), nullable=False)
    candidate: Mapped[Candidate] = relationship(back_populates="resumes")

    applications_used_for: Mapped[List[JobApplication]] = relationship(back_populates="used_resume")

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    def __init__(
        self,
        name: str,
        stored_file: "StoredFile",
        text_content: str,
        candidate: Candidate,
    ):
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

    candidate_id: Mapped[Optional[int]] = mapped_column(ForeignKey("candidate.id"), nullable=False)
    candidate: Mapped[Candidate] = relationship(back_populates="cover_letters")

    applications_used_for: Mapped[List[JobApplication]] = relationship(back_populates="used_cover_letter")

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

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
