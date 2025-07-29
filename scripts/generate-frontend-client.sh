#! /usr/bin/env bash

set -e
set -x

cd ../apps/backend
uv run python -c "import src.api.main; import json; print(json.dumps(src.api.main.app.openapi()))" > ../openapi.json
cd ..
mv openapi.json frontend/
cd frontend
npm run generate-client
