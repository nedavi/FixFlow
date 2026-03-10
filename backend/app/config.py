from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "FixFlow"
    environment: str = "development"
    port: int = 8000
    log_level: str = "INFO"

    database_url: str = "sqlite:///./fixflow.db"

    secret_key: str = "change-me-in-production-use-long-random-string"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
