from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from datetime import datetime


class JobListing(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = None
    url: Optional[HttpUrl] = None
    source: str

    description: Optional[str] = None

    posted_at: Optional[datetime] = None
    scraped_at: datetime = Field(default_factory=datetime.utcnow)

    notes: Optional[str] = None

