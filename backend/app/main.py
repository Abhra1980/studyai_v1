"""
StudyAI Backend – FastAPI application entry point.

Monolith MVP collapsing Syllabus + LLM Orchestrator + Content services.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_tables, dispose_engine
from app.models import *  # noqa: F401,F403 – register all models with Base.metadata
from app.utils.csv_loader import seed_from_csv

# ── Routers ──────────────────────────────────────────────────────────
from app.routers import admin, auth, dashboard, health, learn, progress, quiz, syllabus

logger = logging.getLogger("studyai")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)


# ── Lifespan (startup / shutdown) ───────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run once on startup / shutdown."""
    logger.info("🚀 Starting StudyAI backend …")

    # 1. Create tables if they don't exist
    await create_tables()
    logger.info("✅ Database tables ready")

    # 2. Seed syllabus data from CSV (idempotent)
    await seed_from_csv()
    logger.info("✅ Syllabus data seeded")

    yield  # ── app is running ──

    # Shutdown
    await dispose_engine()
    logger.info("🛑 Database connections closed")


# ── App Factory ──────────────────────────────────────────────────────
app = FastAPI(
    title="StudyAI API",
    description="AI-powered learning platform – syllabus browsing, lesson generation, quizzes",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS (allow React frontend – any localhost port) ──────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include routers ─────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(health.router, prefix=API_PREFIX)
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(syllabus.router, prefix=API_PREFIX)
app.include_router(learn.router, prefix=API_PREFIX)
app.include_router(quiz.router, prefix=API_PREFIX)
app.include_router(progress.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)


# ── Root redirect ───────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return {
        "app": "StudyAI API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": f"{API_PREFIX}/health",
    }
