.PHONY: run test format

dev:
	uv run uvicorn api.main:app --host="127.0.0.1" --port=8000 --reload

test:
	uv run pytest

format:
	ruff format