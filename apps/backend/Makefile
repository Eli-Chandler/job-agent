

.PHONY: run test format

dev:
	uv run uvicorn api.main:app --host="127.0.0.1" --port=8000 --reload

test:
	uv run pytest

format:
	ruff format
migrate:
	uv run alembic upgrade head
client:
	cd ../../scripts && ./generate-frontend-client.sh
migration:
	@read -p "Enter migration message: " MSG; \
	uv run alembic revision --autogenerate -m "$$MSG"