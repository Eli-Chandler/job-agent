import json
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, HTTPException
from fastapi import Depends, Response
from pydantic import ValidationError

from api.auth import create_access_token
from api.config import settings
from api.routers.utils import ErrorModel

from job_agent.services.candidate_service import (
    CandidateService,
)
from job_agent.services.schemas import (
    CreateCandidateRequest,
    CandidateLoginRequest,
    CandidateDTO,
)
from api.dependencies import get_candidate_service

from fastapi.security import OAuth2PasswordRequestForm

auth_router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 1440


@auth_router.post(
    "/register",
    response_model=CandidateDTO,
    responses={
        409: {"model": ErrorModel},
    },
)
async def register(
    response: Response,
    request: CreateCandidateRequest,
    service: CandidateService = Depends(get_candidate_service),
):
    user = await service.create_user(request)
    access_token = create_access_token(
        {
            "sub": str(user.id),
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        domain=settings.cookie_domain,
        samesite="strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return user


@auth_router.post("/token", responses={401: {}})
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: CandidateService = Depends(get_candidate_service),
):
    try:
        login_request = CandidateLoginRequest(
            email=form_data.username, password=form_data.password
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=json.loads(e.json()))
    result = await service.get_user_by_email_and_password(login_request)
    access_token = create_access_token(
        {
            "sub": str(result.id),
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        domain=settings.cookie_domain,
        samesite="strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return {"access_token": access_token, "token_type": "bearer"}
