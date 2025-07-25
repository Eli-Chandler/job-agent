from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
def health_check():
    return {"status": "ok"}

def start_dev():  # Used by pyproject.toml (uv run dev)
    import uvicorn
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)