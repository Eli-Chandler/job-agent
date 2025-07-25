from fastapi import APIRouter
from fastapi.params import Depends
from pydantic import EmailStr

from job_agent.services.candidate_service import CandidateDTO, CreateCandidateRequest, CandidateService, \
    CandidateLoginRequest
from job_agent.services.dependencies import get_candidate_service

from fastapi.security import OAuth2PasswordRequestForm

auth_router = APIRouter()

@auth_router.post("/register", response_model=CandidateDTO)
async def register(
    request: CreateCandidateRequest,
    service: CandidateService = Depends(get_candidate_service)
):
    return await service.create_user(request)


@auth_router.post("/auth/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    login_request = CandidateLoginRequest(
        email=EmailStr.validate_python(form_data.username),
        password=form_data.password
    )

