# tests/conftest.py
import pytest
import pytest_asyncio
import docker
from sqlalchemy import NullPool

from sqlalchemy.ext.asyncio import create_async_engine

from sqlalchemy.ext.asyncio import async_sessionmaker
import time

# Need to make sure these get imported for the tables to be created
from job_agent.models import (
    Base,
    Candidate,
    CandidateSocialLink,
    Resume,
    CoverLetter,
    JobListing,
    JobApplication,
    JobApplicationStatus,
)


POSTGRES_IMAGE = "postgres:16"
CONTAINER_NAME = "reusable-postgres"
POSTGRES_PORT = 5432
POSTGRES_USER = "test"
POSTGRES_PASSWORD = "test"
POSTGRES_DB = "testdb"

def ensure_pgvector_container():
    client = docker.from_env()

    # Check for existing container
    try:
        container = client.containers.get(CONTAINER_NAME)
        if container.status != "running":
            container.start()
        print(f"Reusing existing container: {CONTAINER_NAME}")
    except docker.errors.NotFound:
        print(f"Creating new container: {CONTAINER_NAME}")
        container = client.containers.run(
            POSTGRES_IMAGE,
            name=CONTAINER_NAME,
            ports={'5432/tcp': POSTGRES_PORT},
            environment={
                "POSTGRES_USER": POSTGRES_USER,
                "POSTGRES_PASSWORD": POSTGRES_PASSWORD,
                "POSTGRES_DB": POSTGRES_DB,
            },
            detach=True
        )

        # Wait for DB to be ready
        time.sleep(3)

    return f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:{POSTGRES_PORT}/{POSTGRES_DB}"


@pytest_asyncio.fixture(scope="session")
async def db_engine():
    """Session-scoped async SQLAlchemy engine."""
    async_url = ensure_pgvector_container()
    engine = create_async_engine(async_url, echo=False, poolclass=NullPool)

    # Create schema once per session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

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
    async_session = async_sessionmaker(
        bind=db_connection,
        expire_on_commit=False
    )
    async with async_session() as session:
        yield session