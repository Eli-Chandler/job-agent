from dotenv import load_dotenv
import os

from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

ENV = os.getenv("ENV", "development")
dotenv_path = f".env.{ENV}"


class Settings(BaseSettings):
    database_uri: str
    secret_key: str

    model_config = SettingsConfigDict(env_file=dotenv_path)


settings = Settings()
