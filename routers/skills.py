"""
Skills Router — skill gap analysis, match scoring, skill extraction utility.
"""
from fastapi import APIRouter, HTTPException, Depends

from database import get_supabase
from utils.auth_utils import get_current_user, get_current_student
from utils.skill_taxonomy import SKILL_TAXONOMY, ALL_SKILLS
from services.gap_analysis import calculate_gap
from services.nlp_service import extract_skills_from_text

router = APIRouter(prefix="/api/skills", tags=["Skills"])


@router.get("/gap/{job_role_id}")
async def get_skill_gap(
    job_role_id: str, current_user: dict = Depends(get_current_student)
):
    """
    Calculate skill gap for the student vs a specific job role.
    Returns matched skills, missing skills, and a weighted match score.
    """
    supabase = get_supabase()

    # Get job role
    role_res = supabase.table("job_roles").select("*").eq("id", job_role_id).execute()
    if not role_res.data:
        raise HTTPException(status_code=404, detail="Job role not found")
    job_role = role_res.data[0]

    # Get student skills
    profile_res = (
        supabase.table("student_profiles")
        .select("extracted_skills")
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Student profile not found")

    student_skills = profile_res.data[0].get("extracted_skills") or []
    required_skills = job_role.get("required_skills") or []

    gap = calculate_gap(student_skills, required_skills)

    return {
        "job_role": {
            "id": job_role["id"],
            "title": job_role["title"],
            "category": job_role.get("category"),
        },
        **gap,
    }


@router.get("/match-score/{job_role_id}")
async def get_match_score(
    job_role_id: str, current_user: dict = Depends(get_current_student)
):
    """Return just the numeric match score for a job role."""
    supabase = get_supabase()

    role_res = supabase.table("job_roles").select("required_skills, title").eq("id", job_role_id).execute()
    if not role_res.data:
        raise HTTPException(status_code=404, detail="Job role not found")

    profile_res = (
        supabase.table("student_profiles")
        .select("extracted_skills")
        .eq("user_id", current_user["id"])
        .execute()
    )
    student_skills = (profile_res.data or [{}])[0].get("extracted_skills") or []
    required_skills = role_res.data[0].get("required_skills") or []

    gap = calculate_gap(student_skills, required_skills)
    return {
        "job_role_id": job_role_id,
        "job_title": role_res.data[0].get("title"),
        "match_score": gap["match_score"],
        "must_have_score": gap["must_have_score"],
    }


@router.get("/all")
async def list_all_skills():
    """Return the full skill taxonomy organised by category."""
    return {
        "total_skills": len(ALL_SKILLS),
        "categories": SKILL_TAXONOMY,
    }


@router.post("/extract")
async def extract_skills(body: dict, current_user: dict = Depends(get_current_user)):
    """
    Utility endpoint — extract skills from arbitrary text.
    Body: { "text": "..." }
    """
    text = body.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="'text' field is required")
    skills = extract_skills_from_text(text)
    return {"skills_found": len(skills), "skills": skills}
