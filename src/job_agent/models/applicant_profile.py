from typing import Optional, List

from pydantic import BaseModel, Field

from job_agent.models import Resume, CoverLetter



class ApplicantProfile(BaseModel):
    full_name: str
    email: str
    phone: str
    location: str

    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    personal_website: Optional[str] = None

    resumes: List[Resume] = Field(default_factory=list)
    cover_letters: List[CoverLetter] = Field(default_factory=list)
