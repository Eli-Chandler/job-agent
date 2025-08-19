from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from job_agent.features.common.base import Base


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
