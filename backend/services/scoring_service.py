"""
Scoring Service — ranks/scores candidates for HR dashboard.
"""
import logging
from typing import List, Dict, Optional

from database import get_supabase
from services.gap_analysis import calculate_gap

logger = logging.getLogger(__name__)


def score_candidate(student_profile: Dict, job_role: Dict) -> Dict:
    """
    Calculate a candidate's match score for a job role.
    Returns full breakdown for HR view.
    """
    student_skills = student_profile.get("extracted_skills") or []
    required_skills = job_role.get("required_skills") or []

    gap = calculate_gap(student_skills, required_skills)

    return {
        "student_id": student_profile.get("user_id"),
        "job_role_id": job_role.get("id"),
        "job_role_title": job_role.get("title"),
        "match_score": gap["match_score"],
        "must_have_score": gap["must_have_score"],
        "matched_skills": gap["matched_skills"],
        "missing_skills": gap["missing_skills"],
        "details": gap["details"],
    }


def get_all_candidates_scored(job_role_id: str) -> List[Dict]:
    """
    Fetch all student profiles and score them for a given job role.
    Returns sorted list (highest score first).
    """
    supabase = get_supabase()

    # Get job role
    role_res = supabase.table("job_roles").select("*").eq("id", job_role_id).execute()
    if not role_res.data:
        return []
    job_role = role_res.data[0]

    # Get all student profiles with user info
    profiles_res = supabase.table("student_profiles").select("*").execute()
    profiles = profiles_res.data or []

    scored = []
    for profile in profiles:
        # Fetch user basic info
        user_res = (
            supabase.table("users")
            .select("id, full_name, email, role")
            .eq("id", profile.get("user_id"))
            .execute()
        )
        if not user_res.data:
            continue
        user = user_res.data[0]
        if user.get("role") != "student":
            continue

        score_data = score_candidate(profile, job_role)
        scored.append(
            {
                **score_data,
                "full_name": user.get("full_name"),
                "email": user.get("email"),
                "linkedin_url": profile.get("linkedin_url"),
                "resume_url": profile.get("resume_url"),
            }
        )

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored
