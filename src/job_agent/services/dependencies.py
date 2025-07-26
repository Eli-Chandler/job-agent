from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from job_agent.services.candidate_service import CandidateService
from api.db import get_session


async def get_candidate_service(
    db: AsyncSession = Depends(get_session),
) -> CandidateService:
    return CandidateService(db)
