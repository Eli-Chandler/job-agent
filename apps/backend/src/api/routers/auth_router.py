from typing import Annotated

from fastapi import APIRouter
from fastapi import Depends

from api.auth import create_access_token

from job_agent.services.candidate_service import (
    CandidateService,
)
from job_agent.services.schemas import CreateCandidateRequest, CandidateLoginRequest, CandidateDTO
from api.dependencies import get_candidate_service

from fastapi.security import OAuth2PasswordRequestForm

auth_router = APIRouter()


@auth_router.post("/register", response_model=CandidateDTO)
async def register(
    request: CreateCandidateRequest,
    service: CandidateService = Depends(get_candidate_service),
):
    return await service.create_user(request)


@auth_router.post("/token")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: CandidateService = Depends(get_candidate_service),
):
    login_request = CandidateLoginRequest(
        email=form_data.username, password=form_data.password
    )
    result = await service.get_user_by_email_and_password(login_request)
    access_token = create_access_token(
        {
            "sub": str(result.id),
        }
    )

    return {"access_token": access_token, "token_type": "bearer"}
