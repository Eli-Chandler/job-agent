from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from enum import Enum

from job_agent.models.resume import Resume, CoverLetter


class JobApplicationStatus(str, Enum):
    PENDING = "pending"
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    REJECTED = "rejected"
    OFFERED = "offered"


class JobApplication(BaseModel):
    id: str
    job_listing_id: str

    resume: Optional[Resume]
    cover_letter: Optional[CoverLetter]

    status: JobApplicationStatus = Field(default=JobApplicationStatus.PENDING)
    applied_at: Optional[datetime]
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    notes: str = Field(default="")

