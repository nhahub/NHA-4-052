from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.database.session import Base, engine
import app.models  # Ensures all models are registered with Base.metadata
from app.api.router import router as api_router

settings = get_settings()


def create_app() -> FastAPI:
    """Application factory – creates and configures the FastAPI instance."""

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ─────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routes ───────────────────────────────────────────────────────
    app.include_router(api_router)

    # ── Startup events ───────────────────────────────────────────────
    @app.on_event("startup")
    async def on_startup():
        # Create tables (swap for Alembic migrations in production)
        Base.metadata.create_all(bind=engine)

    @app.get("/", tags=["root"])
    async def root():
        return {
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
        }

    return app


app = create_app()
