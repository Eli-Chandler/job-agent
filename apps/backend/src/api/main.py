from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware

import asyncio

from api.config import settings
from api.routers import (
    auth_router,
    candidate_router,
    me_router,
    job_application_router,
    job_listing_router,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DelayMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        await asyncio.sleep(0.2)  # 200ms delay
        return await call_next(request)


if settings.mock_delay:
    app.add_middleware(DelayMiddleware)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(candidate_router, prefix="/candidates", tags=["candidate"])
app.include_router(me_router, prefix="/me", tags=["me"])
app.include_router(job_listing_router, prefix="/job-listings", tags=["job-listings"])
app.include_router(
    job_application_router, prefix="/job-applications", tags=["job-applications"]
)


@app.get("/health")
def health_check():
    return {"status": "ok"}
