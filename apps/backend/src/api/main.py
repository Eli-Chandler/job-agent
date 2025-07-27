from fastapi import FastAPI

from api.routers.auth_router import auth_router
from api.routers.candidate_router import candidate_router
from api.routers.me_router import me_router
from api.routers.job_listing_router import job_listing_router

from api.routers import auth_router, candidate_router, me_router, job_application_router, job_listing_router
app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(candidate_router, prefix="/candidates", tags=["candidate"])
app.include_router(me_router, prefix="/me", tags=["me"])
app.include_router(job_listing_router, prefix="/job-listings", tags=["job-listings"])
app.include_router(job_application_router, prefix="/job-applications", tags=["job-applications"])


@app.get("/health")
def health_check():
    return {"status": "ok"}


def start_dev():  # Used by pyproject.toml (uv run dev)
    import uvicorn

    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)
