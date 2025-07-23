from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from datetime import datetime


class JobListing(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = None
    is_remote: Optional[bool] = None

    url: Optional[HttpUrl] = None
    source: str

    description: Optional[str] = None
    summary: Optional[str] = None

    tags: List[str] = Field(default_factory=list)
    seniority: Optional[str] = None
    employment_type: Optional[str] = None

    salary_range: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None

    posted_at: Optional[datetime] = None
    scraped_at: datetime = Field(default_factory=datetime.utcnow)

    notes: Optional[str] = None

