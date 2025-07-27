from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
    AsyncEngine,
)

from api.config import settings


engine: AsyncEngine = create_async_engine(
    settings.database_uri,
    echo=False,
    future=True,
)


async_session_maker = async_sessionmaker(
    bind=engine, expire_on_commit=False, autocommit=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


