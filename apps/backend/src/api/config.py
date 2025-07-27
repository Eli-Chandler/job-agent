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

    s3_endpoint_url: str
    s3_access_key_id: str
    s3_secret_access_key: str
    s3_region_name: str

settings = Settings()
