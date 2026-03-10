import signal
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, SessionLocal
from app.logging_config import setup_logging, get_logger
from app.middleware import RequestIDMiddleware
from app.routers import auth, users, equipment, repair_requests

setup_logging()
logger = get_logger("fixflow.startup")


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.database import Base
    import app.models  # noqa: F401 — register all models with Base
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        from app.services.users import seed_admin
        seed_admin(db)
        logger.info("startup_complete", environment=settings.environment)
    finally:
        db.close()

    yield

    logger.info("shutdown_complete")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
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


def _handle_signal(sig, frame):
    logger.info("signal_received", signal=sig)
    sys.exit(0)


signal.signal(signal.SIGTERM, _handle_signal)
signal.signal(signal.SIGINT, _handle_signal)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development",
    )
