"""
SkillMatch AI — FastAPI Backend Entry Point
Start with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
Swagger UI: http://localhost:8000/docs
"""
import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import get_supabase
from routers.auth import router as auth_router
from routers.student import router as student_router
from routers.skills import router as skills_router
from routers.jobs import router as jobs_router
from routers.recommendations import router as recommendations_router
from routers.hr import router as hr_router
from routers.onboarding import router as onboarding_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent / "data"


def seed_data():
    """Seed job roles and courses from JSON files if tables are empty."""
    supabase = get_supabase()

    # Seed job roles
    try:
        roles_check = supabase.table("job_roles").select("id", count="exact").execute()
        if (roles_check.count or 0) == 0:
            jobs_file = DATA_DIR / "job_roles.json"
            if jobs_file.exists():
                roles = json.loads(jobs_file.read_text(encoding="utf-8"))
                supabase.table("job_roles").insert(roles).execute()
                logger.info(f"Seeded {len(roles)} job roles ✓")
        else:
            logger.info(f"Job roles already seeded ({roles_check.count} rows)")
    except Exception as e:
        logger.warning(f"Could not seed job_roles (schema cache may need reload): {e}")

    # Seed courses
    try:
        courses_check = supabase.table("courses").select("id", count="exact").execute()
        if (courses_check.count or 0) == 0:
            courses_file = DATA_DIR / "courses.json"
            if courses_file.exists():
                courses = json.loads(courses_file.read_text(encoding="utf-8"))
                supabase.table("courses").insert(courses).execute()
                logger.info(f"Seeded {len(courses)} courses ✓")
        else:
            logger.info(f"Courses already seeded ({courses_check.count} rows)")
    except Exception as e:
        logger.warning(f"Could not seed courses (schema cache may need reload): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: verify DB connection and seed data."""
    logger.info("─── SkillMatch AI starting up ───")
    try:
        seed_data()
    except Exception as e:
        logger.warning(f"Seed skipped: {e}")
    logger.info("Server ready ✓  —  Open http://localhost:8000/docs")
    yield
    logger.info("─── SkillMatch AI shutting down ───")


app = FastAPI(
    title="SkillMatch AI",
    description=(
        "Career navigation API — skill gap analysis, personalised course recommendations, "
        "and AI-powered candidate scoring for HR teams."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(student_router)
app.include_router(skills_router)
app.include_router(jobs_router)
app.include_router(recommendations_router)
app.include_router(hr_router)
app.include_router(onboarding_router)

# ─── Root ────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "SkillMatch AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check_route():
    return {"status": "ok", "service": "skillmatch-api", "version": "1.0"}


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check — verifies DB connectivity."""
    try:
        supabase = get_supabase()
        supabase.table("users").select("id", count="exact").execute()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@app.post("/api/seed", tags=["Admin"])
async def manual_seed():
    """Manually trigger database seeding. Use this after schema cache is reloaded."""
    try:
        seed_data()
        return {"message": "Seeding complete ✓"}
    except Exception as e:
        return {"message": "Seeding failed", "error": str(e)}


@app.post("/api/reload-schema", tags=["Admin"])
async def reload_schema():
    """Send NOTIFY to PostgREST to reload schema cache."""
    try:
        supabase = get_supabase()
        supabase.rpc("reload_pgrst_schema", {}).execute()
        return {"message": "Schema reload requested. Wait a few seconds, then try /api/seed"}
    except Exception:
        return {
            "message": "Auto-reload not available. Ask the Supabase admin to: "
                       "Supabase Dashboard → Project Settings → API → Reload schema cache"
        }

