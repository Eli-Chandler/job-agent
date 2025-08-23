from __future__ import annotations

from datetime import date
from sqlalchemy import (
    String,
    Date,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from job_agent.features.common.base import Base, TimestampMixin

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from job_agent.features.candidate.candidate_model import Candidate


class Profile(TimestampMixin, Base):
    __tablename__ = "profile"
    id: Mapped[int] = mapped_column(primary_key=True)

    first_name: Mapped[str] = mapped_column(String(80), nullable=False)
    last_name: Mapped[str] = mapped_column(String(80), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(40), nullable=False)
    work_location: Mapped[str | None] = mapped_column(String(160), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidate.id"), nullable=False)
    candidate: Mapped["Candidate"] = relationship(back_populates="profile")

    experiences: Mapped[list["ProfileExperience"]] = relationship(back_populates="profile", cascade="all, delete-orphan")
    educations: Mapped[list["ProfileEducation"]] = relationship(back_populates="profile", cascade="all, delete-orphan")
    projects: Mapped[list["ProfileProject"]] = relationship(back_populates="profile", cascade="all, delete-orphan")
    skills: Mapped[list["ProfileSkill"]] = relationship(back_populates="profile", cascade="all, delete-orphan")
    certifications: Mapped[list["ProfileCertification"]] = relationship(back_populates="profile", cascade="all, delete-orphan")
    links: Mapped[list["ProfileLink"]] = relationship(back_populates="profile", cascade="all, delete-orphan")
    # custom_sections: Mapped[list["ProfileCustomSection"]] = relationship(back_populates="profile")

    def __init__(
        self,
        first_name: str,
        last_name: str,
        contact_email: str,
        candidate: Candidate,
        contact_phone: str,
        work_location: str | None = None,
        summary: str | None = None,
    ):
        super().__init__()

        self.first_name = first_name
        self.last_name = last_name
        self.contact_email = contact_email
        self.contact_phone = contact_phone
        self.work_location = work_location
        self.summary = summary

        self.candidate = candidate

        self.experiences = []
        self.educations = []
        self.projects = []
        self.skills = []
        self.certifications = []
        self.links = []



class ProfileExperience(TimestampMixin, Base):
    __tablename__ = "profile_experience"
    id: Mapped[int] = mapped_column(primary_key=True)

    company: Mapped[str] = mapped_column(String(160), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    profile_id: Mapped[int] = mapped_column(ForeignKey("profile.id"), nullable=False)
    profile: Mapped["Profile"] = relationship(back_populates="experiences")

    @property
    def is_current(self) -> bool:
        return self.end_date is None

    def __init__(
        self,
        company: str,
        title: str,
        start_date: date,
        profile: Profile,
        description: str,
        end_date: date | None = None,
    ):
        super().__init__()

        self.company = company
        self.title = title
        self.start_date = start_date
        self.description = description
        self.end_date = end_date

        self.profile = profile


class ProfileEducation(TimestampMixin, Base):
    __tablename__ = "profile_education"
    id: Mapped[int] = mapped_column(primary_key=True)

    school: Mapped[str] = mapped_column(String(160), nullable=False)
    degree: Mapped[str] = mapped_column(String(50), nullable=False)
    field: Mapped[str | None] = mapped_column(String(80), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    profile_id: Mapped[int] = mapped_column(ForeignKey("profile.id"), nullable=False)
    profile: Mapped["Profile"] = relationship(back_populates="educations")

    @property
    def is_current(self) -> bool:
        return self.end_date is None

    def __init__(
        self,
        school: str,
        start_date: date,
        profile: Profile,
        degree: str,
        field: str | None = None,
        end_date: date | None = None,
        description: str | None = None,
    ):
        super().__init__()

        self.school = school
        self.degree = degree
        self.field = field
        self.start_date = start_date
        self.end_date = end_date
        self.description = description

        self.profile = profile


class ProfileProject(TimestampMixin, Base):
    __tablename__ = "profile_project"
    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    profile_id: Mapped[int] = mapped_column(ForeignKey("profile.id"), nullable=False)
    profile: Mapped["Profile"] = relationship(back_populates="projects")

    def __init__(
        self,
        name: str,
        profile: Profile,
        description: str,
        url: str | None = None,
    ):
        super().__init__()

        self.name = name
        self.description = description
        self.url = url

        self.profile = profile


class ProfileSkill(TimestampMixin, Base):
    __tablename__ = "profile_skill"
    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(80), nullable=False)

    profile_id: Mapped[int] = mapped_column(ForeignKey("profile.id"), nullable=False)
    profile: Mapped["Profile"] = relationship(back_populates="skills")

    def __init__(self, name: str, profile: Profile):
        super().__init__()

        self.name = name
        self.profile = profile


class ProfileCertification(TimestampMixin, Base):
    __tablename__ = "profile_certification"
    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    issuer: Mapped[str | None] = mapped_column(String(160), nullable=True)
    date_issued: Mapped[date | None] = mapped_column(Date, nullable=True)

    profile_id: Mapped[int] = mapped_column(ForeignKey("profile.id"), nullable=False)
    profile: Mapped["Profile"] = relationship(back_populates="certifications")

    def __init__(
        self,
        name: str,
        profile: Profile,
        issuer: str | None = None,
        date_issued: date | None = None,
    ):
        super().__init__()

        self.name = name
        self.issuer = issuer
        self.date_issued = date_issued

        self.profile = profile


class ProfileLink(TimestampMixin, Base):
    __tablename__ = "profile_link"
    id: Mapped[int] = mapped_column(primary_key=True)

    label: Mapped[str] = mapped_column(String(80), nullable=False)  # "GitHub", "Portfolio"
    url: Mapped[str] = mapped_column(String(255), nullable=False)

    profile_id: Mapped[int] = mapped_column(ForeignKey("profile.id"), nullable=False)
    profile: Mapped["Profile"] = relationship(back_populates="links")

    def __init__(self, label: str, url: str, profile: Profile):
        super().__init__()

        self.label = label
        self.url = url

        self.profile = profile


# class ProfileCustomSection(TimestampMixin, Base):
#     __tablename__ = "profile_custom_section"
#     id: Mapped[int] = mapped_column(primary_key=True)
#
#     name: Mapped[str] = mapped_column(String(80), nullable=False)
#     position: Mapped[int] = mapped_column(Integer, default=99, nullable=False)
#     is_visible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
#
#     items: Mapped[list["ProfileCustomItem"]] = relationship(back_populates="section")
#
#     profile_id: Mapped[int] = mapped_column(ForeignKey("profile.id"), nullable=False)
#     profile: Mapped["Profile"] = relationship(back_populates="custom_sections")
#
#     created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
#     updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
#
#
# class ProfileCustomItem(TimestampMixin, Base):
#     __tablename__ = "profile_custom_item"
#     id: Mapped[int] = mapped_column(primary_key=True)
#
#     title: Mapped[str] = mapped_column(String(160), nullable=False)
#     content: Mapped[str | None] = mapped_column(Text, nullable=True)
#
#     section_id: Mapped[int] = mapped_column(ForeignKey("profile_custom_section.id"), nullable=False)
#     section: Mapped["ProfileCustomSection"] = relationship(back_populates="items")
#
#     created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
#     updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
