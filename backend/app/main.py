from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.logging_config import get_logger, setup_logging
from app.middleware import RequestIDMiddleware
from app.routers import auth, equipment, repair_requests, users

setup_logging()
logger = get_logger("fixflow.startup")


@asynccontextmanager
async def lifespan(app: FastAPI):
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from app.services.users import seed_demo_data
        seed_demo_data(db)
        logger.info("startup_complete", environment=settings.environment)
    finally:
        db.close()

    yield

    logger.info("shutdown_complete")


DESCRIPTION = """
**FixFlow** — система управления заявками на ремонт оборудования.

## Аутентификация
Все защищённые эндпоинты требуют JWT Bearer токен.
Получить токен: `POST /api/auth/login`.

## Роли
| Роль | Доступ |
|------|--------|
| `admin` | Полный доступ |
| `manager` | CRUD заявок и оборудования |
| `technician` | Просмотр и обновление статуса заявок |
| `client` | Создание и просмотр своих заявок |
"""

TAGS_METADATA = [
    {"name": "auth", "description": "Регистрация, вход, текущий пользователь"},
    {"name": "users", "description": "Управление пользователями (admin)"},
    {"name": "equipment", "description": "Справочник оборудования"},
    {"name": "repair_requests", "description": "Заявки на ремонт"},
]

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description=DESCRIPTION,
    openapi_tags=TAGS_METADATA,
    lifespan=lifespan,
)

app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(equipment.router)
app.include_router(repair_requests.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development",
    )
