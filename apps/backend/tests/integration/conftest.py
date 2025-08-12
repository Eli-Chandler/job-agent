# tests/conftest.py
from typing import AsyncGenerator
import botocore
import pytest
import pytest_asyncio
from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from testcontainers.postgres import PostgresContainer

from types_aiobotocore_s3.client import S3Client

from job_agent.models import Base
from job_agent.services.s3_file_uploader import S3FileUploader
from testcontainers.core import testcontainers_config

# Since we're re-using containers ryuk is useless anyway, this will make startup faster
testcontainers_config.ryuk_disabled = True

BUCKET_NAME = 'test-bucket'

@pytest_asyncio.fixture(scope="function")
async def s3_client(aioboto3_s3_client: S3Client) -> AsyncGenerator[S3Client, None]:
    client = aioboto3_s3_client

    try:
        await client.create_bucket(Bucket=BUCKET_NAME)
        print(f"Created bucket: {BUCKET_NAME}")
    except botocore.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "BucketAlreadyOwnedByYou":
            print(f"Bucket already exists: {BUCKET_NAME}")
        else:
            print(f"Error creating bucket: {e}")
            raise

    yield client



@pytest_asyncio.fixture(scope="function")
async def s3_file_uploader(
    db_session: AsyncSession, s3_client: S3Client
) -> AsyncGenerator[S3FileUploader, None]:
    """Create S3FileUploader with cleanup."""
    uploader = S3FileUploader(
        db=db_session, s3_client=s3_client, bucket_name=BUCKET_NAME
    )

    yield uploader

    # Cleanup after test: remove all objects from the bucket
    try:
        response = await s3_client.list_objects_v2(Bucket=BUCKET_NAME)
        contents = response.get("Contents", [])
        if contents:
            await s3_client.delete_objects(
                Bucket=BUCKET_NAME,
                Delete={"Objects": [{"Key": obj["Key"]} for obj in contents]},
            )
            print(f"Cleaned up {len(contents)} objects from bucket")
    except Exception as e:
        print(f"Warning: Could not clean up bucket: {e}")


@pytest_asyncio.fixture(scope="session")
async def db_engine():
    postgres_container = PostgresContainer("postgres:16-alpine", driver=None, reuse=True)
    postgres_container.start()
    async_url = postgres_container.get_connection_url().replace(
        "postgresql://", "postgresql+asyncpg://"
    )
    engine = create_async_engine(async_url, echo=False, poolclass=NullPool)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    try:
        yield engine
    finally:
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
