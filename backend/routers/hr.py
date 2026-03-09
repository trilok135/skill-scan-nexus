"""
HR Router — Candidate discovery, scoring, shortlisting, and analytics.
All routes require HR role.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional

from database import get_supabase
from models.application import ApplicationStatusUpdate
from utils.auth_utils import get_current_hr
from services.scoring_service import get_all_candidates_scored, score_candidate
from services.gap_analysis import calculate_gap

router = APIRouter(prefix="/api/hr", tags=["HR Dashboard"])


@router.get("/candidates")
async def list_candidates(
    job_role_id: Optional[str] = Query(None, description="Filter & score by job role"),
    min_score: float = Query(0, description="Minimum match score filter"),
    current_user: dict = Depends(get_current_hr),
):
    """
    List all student candidates.
    If job_role_id is provided, candidates are scored and sorted by match.
    """
    supabase = get_supabase()

    if job_role_id:
        candidates = get_all_candidates_scored(job_role_id)
        candidates = [c for c in candidates if c["match_score"] >= min_score]
        return {"total": len(candidates), "candidates": candidates, "job_role_id": job_role_id}

    # No job role filter — return all students with basic info
    users_res = (
        supabase.table("users")
        .select("id, full_name, email, created_at")
        .eq("role", "student")
        .execute()
    )
    students = users_res.data or []

    # Enrich with skill count
    result = []
    for s in students:
        profile_res = (
            supabase.table("profiles")
            .select("extracted_skills, resume_url, linkedin_url")
            .eq("id", s["id"])
            .execute()
        )
        p = (profile_res.data or [{}])[0]
        result.append({
            **s,
            "skills_count": len(p.get("extracted_skills") or []),
            "resume_uploaded": bool(p.get("resume_url")),
            "linkedin_connected": bool(p.get("linkedin_url")),
        })

    return {"total": len(result), "candidates": result}


@router.get("/candidates/top/{job_role_id}")
async def top_candidates(
    job_role_id: str,
    n: int = Query(10, description="Number of top candidates to return"),
    current_user: dict = Depends(get_current_hr),
):
    """Return top N candidates for a specific job role."""
    all_scored = get_all_candidates_scored(job_role_id)
    return {"top_candidates": all_scored[:n], "job_role_id": job_role_id}


@router.get("/candidates/{student_id}")
async def get_candidate_detail(
    student_id: str,
    job_role_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_hr),
):
    """
    Full candidate profile.
    If job_role_id provided, includes detailed skill gap breakdown.
    """
    supabase = get_supabase()

    user_res = supabase.table("users").select("id, full_name, email, created_at, role").eq("id", student_id).execute()
    if not user_res.data or user_res.data[0].get("role") != "student":
        raise HTTPException(status_code=404, detail="Student not found")

    profile_res = (
        supabase.table("profiles").select("*").eq("id", student_id).execute()
    )
    profile = (profile_res.data or [{}])[0]

    response = {
        "user": user_res.data[0],
        "profile": profile,
    }

    if job_role_id:
        role_res = supabase.table("job_roles").select("*").eq("id", job_role_id).execute()
        if role_res.data:
            job_role = role_res.data[0]
            student_skills = profile.get("extracted_skills") or []
            gap = calculate_gap(student_skills, job_role.get("required_skills") or [])
            response["skill_gap"] = gap
            response["job_role"] = job_role

    return response


@router.post("/shortlist/{student_id}")
async def shortlist_candidate(
    student_id: str,
    body: ApplicationStatusUpdate,
    job_role_id: str = Query(...),
    current_user: dict = Depends(get_current_hr),
):
    """Shortlist or reject a candidate for a job role."""
    supabase = get_supabase()

    # Upsert application status
    # Check if application exists
    existing = (
        supabase.table("applications")
        .select("id")
        .eq("student_id", student_id)
        .eq("job_role_id", job_role_id)
        .execute()
    )

    if existing.data:
        supabase.table("applications").update({"status": body.status.value}).eq(
            "id", existing.data[0]["id"]
        ).execute()
    else:
        # Get match score first
        profile_res = (
            supabase.table("profiles")
            .select("extracted_skills")
            .eq("id", student_id)
            .execute()
        )
        student_skills = (profile_res.data or [{}])[0].get("extracted_skills") or []
        role_res = supabase.table("job_roles").select("required_skills").eq("id", job_role_id).execute()
        required_skills = (role_res.data or [{}])[0].get("required_skills") or []
        gap = calculate_gap(student_skills, required_skills)

        supabase.table("applications").insert(
            {
                "student_id": student_id,
                "job_role_id": job_role_id,
                "match_score": gap["match_score"],
                "matched_skills": gap["matched_skills"],
                "missing_skills": gap["missing_skills"],
                "status": body.status.value,
            }
        ).execute()

    return {"message": f"Candidate {body.status.value}", "student_id": student_id}


@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_hr)):
    """Platform-wide analytics for HR."""
    supabase = get_supabase()

    # Total counts
    students = supabase.table("users").select("id", count="exact").eq("role", "student").execute()
    hr_users = supabase.table("users").select("id", count="exact").eq("role", "hr").execute()
    jobs = supabase.table("job_roles").select("id", count="exact").execute()
    apps = supabase.table("applications").select("id, status, match_score").execute()

    applications = apps.data or []
    shortlisted = [a for a in applications if a.get("status") == "shortlisted"]
    avg_score = (
        round(sum(a["match_score"] for a in applications) / len(applications), 1)
        if applications
        else 0
    )

    # Skill demand — count required skills across all job roles
    all_roles_res = supabase.table("job_roles").select("required_skills").execute()
    skill_demand: dict = {}
    for role in (all_roles_res.data or []):
        for req in (role.get("required_skills") or []):
            sn = req.get("skill_name", "")
            skill_demand[sn] = skill_demand.get(sn, 0) + 1
    top_skills = sorted(skill_demand.items(), key=lambda x: x[1], reverse=True)[:20]

    return {
        "total_students": students.count or 0,
        "total_hr_users": hr_users.count or 0,
        "total_job_roles": jobs.count or 0,
        "total_applications": len(applications),
        "total_shortlisted": len(shortlisted),
        "average_match_score": avg_score,
        "top_demanded_skills": [{"skill": s, "demand": d} for s, d in top_skills],
    }
