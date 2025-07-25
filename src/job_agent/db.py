from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine, AsyncEngine
from dotenv import load_dotenv
import os

load_dotenv()

ENV = os.getenv("ENV", "development")
load_dotenv(dotenv_path=f".env.{ENV}")

DATABASE_URL = os.getenv("DATABASE_URL")

engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)


async_session_maker = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autocommit=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()