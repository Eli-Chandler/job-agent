# tests/conftest.py
from typing import AsyncGenerator
import asyncio
import aioboto3
import botocore
import pytest
import pytest_asyncio
import docker
import socket
import time
from botocore.config import Config
from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker

from types_aiobotocore_s3.client import S3Client

from job_agent.models import (
    Base,
)
from job_agent.services.s3_file_uploader import S3FileUploader

POSTGRES_IMAGE = "postgres:16"
CONTAINER_NAME = "reusable-postgres"
POSTGRES_PORT = 5432
POSTGRES_USER = "test"
POSTGRES_PASSWORD = "test"
POSTGRES_DB = "testdb"

MINIO_IMAGE = "minio/minio:latest"
MINIO_CONTAINER_NAME = "reusable-minio"
MINIO_PORT = 9000
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "minioadmin"
MINIO_BUCKET = "test-bucket"
MINIO_ENDPOINT_URL = f"http://localhost:{MINIO_PORT}"

def ensure_minio_container():
    client = docker.from_env()

    try:
        container = client.containers.get(MINIO_CONTAINER_NAME)
        if container.status != "running":
            container.start()
            print(f"Started existing MinIO container: {MINIO_CONTAINER_NAME}")
            # Give it time to start up after restart
            time.sleep(3)
        else:
            print(f"Reusing running MinIO container: {MINIO_CONTAINER_NAME}")
    except docker.errors.NotFound:
        print(f"Creating new MinIO container: {MINIO_CONTAINER_NAME}")
        client.containers.run(
            MINIO_IMAGE,
            name=MINIO_CONTAINER_NAME,
            ports={"9000/tcp": MINIO_PORT},
            environment={
                "MINIO_ROOT_USER": MINIO_ACCESS_KEY,
                "MINIO_ROOT_PASSWORD": MINIO_SECRET_KEY,
            },
            command="server /data",
            detach=True,
        )

    # Wait until MinIO's port is actually accepting connections
    max_retries = 60  # Increased timeout
    for i in range(max_retries):
        try:
            with socket.create_connection(("localhost", MINIO_PORT), timeout=2):
                print(f"MinIO is ready after {i+1} attempts")
                break
        except (OSError, ConnectionRefusedError):
            time.sleep(1)
    else:
        raise RuntimeError(f"MinIO never came up on port {MINIO_PORT} after {max_retries} seconds")

    # Additional wait to ensure MinIO API is fully ready
    time.sleep(2)

    return {
        "endpoint_url": MINIO_ENDPOINT_URL,
        "aws_access_key_id": MINIO_ACCESS_KEY,
        "aws_secret_access_key": MINIO_SECRET_KEY,
        "region_name": "us-east-1",
        "bucket_name": MINIO_BUCKET,
    }

@pytest_asyncio.fixture(scope="session")
async def s3_config():
    """Ensure MinIO container is running and return S3 connection config."""
    return ensure_minio_container()

async def wait_for_minio_api(s3_config, max_retries=30):
    """Wait for MinIO API to be ready by attempting to list buckets."""
    session = aioboto3.Session()

    for i in range(max_retries):
        try:
            async with session.client(
                    "s3",
                    endpoint_url=s3_config["endpoint_url"],
                    aws_access_key_id=s3_config["aws_access_key_id"],
                    aws_secret_access_key=s3_config["aws_secret_access_key"],
                    region_name=s3_config["region_name"],
                    config=Config(
                        s3={"addressing_style": "path"},
                        retries={"max_attempts": 1},  # Don't retry within boto3
                        connect_timeout=5,
                        read_timeout=10
                    ),
            ) as client:
                # Try a simple operation to verify API is ready
                await client.list_buckets()
                print(f"MinIO API is ready after {i+1} attempts")
                return
        except Exception as e:
            print(f"MinIO API not ready (attempt {i+1}/{max_retries}): {e}")
            await asyncio.sleep(1)

    raise RuntimeError(f"MinIO API never became ready after {max_retries} attempts")

@pytest_asyncio.fixture(scope="function")
async def s3_client(s3_config) -> AsyncGenerator[S3Client, None]:
    """Yield an S3 client connected to MinIO."""
    # Wait for MinIO API to be ready
    await wait_for_minio_api(s3_config)

    session = aioboto3.Session()
    async with session.client(
            "s3",
            endpoint_url=s3_config["endpoint_url"],
            aws_access_key_id=s3_config["aws_access_key_id"],
            aws_secret_access_key=s3_config["aws_secret_access_key"],
            region_name=s3_config["region_name"],
            config=Config(
                s3={"addressing_style": "path"},
                retries={"max_attempts": 3},
                connect_timeout=10,
                read_timeout=30
            ),
    ) as client:
        # Ensure the bucket exists
        try:
            await client.create_bucket(Bucket=s3_config["bucket_name"])
            print(f"Created bucket: {s3_config['bucket_name']}")
        except botocore.exceptions.ClientError as e:
            if e.response["Error"]["Code"] == "BucketAlreadyOwnedByYou":
                print(f"Bucket already exists: {s3_config['bucket_name']}")
            else:
                print(f"Error creating bucket: {e}")
                raise

        yield client

@pytest_asyncio.fixture(scope="function")
async def s3_file_uploader(db_session: AsyncSession, s3_client: S3Client, s3_config) -> S3FileUploader:
    """Create S3FileUploader with cleanup."""
    uploader = S3FileUploader(
        db=db_session,
        s3_client=s3_client,
        bucket_name=s3_config["bucket_name"]
    )

    yield uploader

    # Cleanup after test: remove all objects from the bucket
    try:
        response = await s3_client.list_objects_v2(Bucket=s3_config["bucket_name"])
        contents = response.get("Contents", [])
        if contents:
            await s3_client.delete_objects(
                Bucket=s3_config["bucket_name"],
                Delete={"Objects": [{"Key": obj["Key"]} for obj in contents]}
            )
            print(f"Cleaned up {len(contents)} objects from bucket")
    except Exception as e:
        print(f"Warning: Could not clean up bucket: {e}")

def ensure_pgvector_container():
    client = docker.from_env()

    # Check for existing container
    try:
        container = client.containers.get(CONTAINER_NAME)
        if container.status != "running":
            container.start()
            print(f"Started existing container: {CONTAINER_NAME}")
            # Give it time to start up after restart
            time.sleep(5)
        else:
            print(f"Reusing running container: {CONTAINER_NAME}")
    except docker.errors.NotFound:
        print(f"Creating new container: {CONTAINER_NAME}")
        container = client.containers.run(
            POSTGRES_IMAGE,
            name=CONTAINER_NAME,
            ports={"5432/tcp": POSTGRES_PORT},
            environment={
                "POSTGRES_USER": POSTGRES_USER,
                "POSTGRES_PASSWORD": POSTGRES_PASSWORD,
                "POSTGRES_DB": POSTGRES_DB,
            },
            detach=True,
        )

        # Wait for DB to be ready
        print("Waiting for PostgreSQL to be ready...")
        time.sleep(8)

    return f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:{POSTGRES_PORT}/{POSTGRES_DB}"

@pytest_asyncio.fixture(scope="session")
async def db_engine():
    """Session-scoped async SQLAlchemy engine."""
    async_url = ensure_pgvector_container()
    engine = create_async_engine(
        async_url,
        echo=False,
        poolclass=NullPool,
        pool_pre_ping=True  # Verify connections before use
    )

    # Create schema once per session
    max_retries = 5
    for i in range(max_retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
                await conn.run_sync(Base.metadata.create_all)
            print("Database schema created successfully")
            break
        except Exception as e:
            if i == max_retries - 1:
                raise
            print(f"Database not ready (attempt {i+1}/{max_retries}): {e}")
            await asyncio.sleep(2)

    yield engine

    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def db_connection(db_engine):
    """Rollback-wrapped connection for each test."""
    async with db_engine.connect() as conn:
        trans = await conn.begin()
        try:
            yield conn
        finally:
            await trans.rollback()

@pytest_asyncio.fixture(scope="function")
async def db_session(db_connection):
    """Async session fixture with transaction rollback."""
    async_session = async_sessionmaker(bind=db_connection, expire_on_commit=False)
    async with async_session() as session:
        yield session


@pytest.fixture
def sample_resume() -> bytes:
    with open("tests/data/resume-sample.pdf", "rb") as f:
        return f.read()