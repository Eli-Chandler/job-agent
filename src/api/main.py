from fastapi import FastAPI

from api.routers.auth_router import auth_router
from api.routers.candidate_router import candidate_router

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(candidate_router, prefix="/candidate", tags=["candidate"])


@app.get("/health")
def health_check():
    return {"status": "ok"}


def start_dev():  # Used by pyproject.toml (uv run dev)
    import uvicorn

    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)
