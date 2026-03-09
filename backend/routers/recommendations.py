"""
Recommendations Router — personalised course and task recommendations.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends

from database import get_supabase
from utils.auth_utils import get_current_student
from services.gap_analysis import calculate_gap
from services.recommendation_engine import get_recommendations
from services.email_service import send_free_course_alert

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/{job_role_id}")
async def get_recommendation(
    job_role_id: str, current_user: dict = Depends(get_current_student)
):
    """
    Generate personalised recommendations for a student targeting a job role.
    Calculates skill gap → fetches matching courses → saves to DB.
    """
    supabase = get_supabase()

    # Get job role
    role_res = supabase.table("job_roles").select("*").eq("id", job_role_id).execute()
    if not role_res.data:
        raise HTTPException(status_code=404, detail="Job role not found")
    job_role = role_res.data[0]

    # Get student profile
    profile_res = (
        supabase.table("profiles")
        .select("extracted_skills")
        .eq("id", current_user["id"])
        .execute()
    )
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Student profile not found")

    student_skills = profile_res.data[0].get("extracted_skills") or []
    required_skills = job_role.get("required_skills") or []

    # Gap analysis
    gap = calculate_gap(student_skills, required_skills)
    missing_skills = gap["missing_skills"]

    # Get recommendations
    recs = get_recommendations(missing_skills, job_role_id)
    recommended_courses = recs["recommended_courses"]
    practice_tasks = recs["practice_tasks"]

    # Persist recommendation
    rec_data = {
        "user_id": current_user["id"],
        "job_role_id": job_role_id,
        "missing_skills": missing_skills,
        "recommended_courses": recommended_courses,
        "practice_tasks": practice_tasks,
        "match_score": gap["match_score"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    supabase.table("recommendations").upsert(
        rec_data, on_conflict="user_id,job_role_id"
    ).execute()

    # Notify via email about free courses (background-safe fire-and-forget)
    free_courses = [c for c in recommended_courses if c.get("course_type") == "free"]
    if free_courses:
        import asyncio
        asyncio.create_task(send_free_course_alert(current_user, free_courses))

    return {
        "job_role": {"id": job_role["id"], "title": job_role["title"]},
        "match_score": gap["match_score"],
        "must_have_score": gap["must_have_score"],
        "matched_skills": gap["matched_skills"],
        "missing_skills": missing_skills,
        "recommended_courses": recommended_courses,
        "practice_tasks": practice_tasks,
    }


@router.get("/courses/free")
async def get_free_courses(current_user: dict = Depends(get_current_student)):
    """Return free courses that cover the student's missing skills."""
    supabase = get_supabase()

    # Get student skills and latest recommendations
    profile_res = (
        supabase.table("profiles")
        .select("extracted_skills")
        .eq("id", current_user["id"])
        .execute()
    )
    student_skills = (profile_res.data or [{}])[0].get("extracted_skills") or []
    student_skill_names = {s["skill_name"].lower() for s in student_skills}

    # Get all free courses
    courses_res = (
        supabase.table("courses").select("*").eq("course_type", "free").execute()
    )
    all_free = courses_res.data or []

    # Filter courses that teach missing skills
    relevant = [
        c for c in all_free
        if any(sk.lower() not in student_skill_names for sk in (c.get("skills_covered") or []))
    ]
    relevant.sort(key=lambda c: -c.get("rating", 0))

    return {"total": len(relevant), "free_courses": relevant}


@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_student)):
    """Return all past recommendations for the student."""
    supabase = get_supabase()
    result = (
        supabase.table("recommendations")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("generated_at", desc=True)
        .execute()
    )
    return {"total": len(result.data or []), "history": result.data or []}
