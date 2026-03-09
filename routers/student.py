"""
Student Router — Profile management, resume upload, LinkedIn sync, dashboard.
"""
import io
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks

from database import get_supabase
from models.profile import StudentProfileUpdate
from utils.auth_utils import get_current_student
from utils.pdf_parser import extract_text_from_pdf
from services.nlp_service import extract_skills_from_text

router = APIRouter(prefix="/api/student", tags=["Student"])


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_student)):
    """Return the authenticated student's full profile."""
    supabase = get_supabase()
    result = (
        supabase.table("student_profiles")
        .select("*")
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = result.data[0]
    profile["user"] = current_user
    return profile


@router.put("/profile")
async def update_profile(
    updates: StudentProfileUpdate,
    current_user: dict = Depends(get_current_student),
):
    """Manually update student profile fields."""
    supabase = get_supabase()
    payload = {k: v for k, v in updates.model_dump().items() if v is not None}
    payload["last_updated"] = datetime.now(timezone.utc).isoformat()

    result = (
        supabase.table("student_profiles")
        .update(payload)
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=500, detail="Profile update failed")
    return {"message": "Profile updated", "profile": result.data[0]}


@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_student),
):
    """
    Upload a PDF resume.
    1. Stores file in Supabase Storage (bucket: resumes)
    2. Extracts text from PDF
    3. Runs NLP skill extraction
    4. Updates student profile with extracted skills
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    supabase = get_supabase()
    file_bytes = await file.read()

    # Upload to Supabase Storage
    storage_path = f"{current_user['id']}/resume.pdf"
    try:
        supabase.storage.from_("resumes").upload(
            storage_path, file_bytes, {"content-type": "application/pdf", "upsert": "true"}
        )
        public_url = supabase.storage.from_("resumes").get_public_url(storage_path)
    except Exception as e:
        # If storage fails, continue with skill extraction anyway
        public_url = ""

    # Extract text and skills
    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text:
        raise HTTPException(status_code=422, detail="Could not extract text from PDF")

    extracted_skills = extract_skills_from_text(resume_text)

    # Update profile
    update_payload = {
        "extracted_skills": extracted_skills,
        "resume_url": public_url or "",
        "resume_text": resume_text[:10000],  # cap at 10k chars
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }
    supabase.table("student_profiles").update(update_payload).eq(
        "user_id", current_user["id"]
    ).execute()

    return {
        "message": "Resume processed successfully",
        "skills_extracted": len(extracted_skills),
        "skills": extracted_skills,
        "resume_url": public_url,
    }


@router.get("/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_student)):
    """Aggregated dashboard statistics for the student."""
    supabase = get_supabase()

    profile_res = (
        supabase.table("student_profiles")
        .select("extracted_skills, resume_url, linkedin_url")
        .eq("user_id", current_user["id"])
        .execute()
    )
    profile = profile_res.data[0] if profile_res.data else {}

    skills = profile.get("extracted_skills") or []

    # Count recommendations
    rec_res = (
        supabase.table("recommendations")
        .select("id", count="exact")
        .eq("user_id", current_user["id"])
        .execute()
    )
    rec_count = rec_res.count or 0

    # Count applications
    app_res = (
        supabase.table("applications")
        .select("id, status, match_score", count="exact")
        .eq("student_id", current_user["id"])
        .execute()
    )
    apps = app_res.data or []
    avg_score = (
        round(sum(a["match_score"] for a in apps) / len(apps), 1) if apps else 0
    )

    return {
        "user": current_user,
        "total_skills": len(skills),
        "skills": skills,
        "resume_uploaded": bool(profile.get("resume_url")),
        "linkedin_connected": bool(profile.get("linkedin_url")),
        "total_recommendations": rec_count,
        "total_applications": len(apps),
        "average_match_score": avg_score,
    }


@router.post("/linkedin/sync")
async def linkedin_sync(
    data: dict,
    current_user: dict = Depends(get_current_student),
):
    """
    Sync LinkedIn profile data.
    Expects: {linkedin_url, skills: ["skill1","skill2"], summary: "..."}
    """
    supabase = get_supabase()
    linkedin_url = data.get("linkedin_url", "")
    raw_skills = data.get("skills", [])
    summary = data.get("summary", "")

    # Extract from summary text too
    nlp_skills = extract_skills_from_text(summary) if summary else []

    # Merge manually provided skills with NLP-extracted ones
    all_skill_names = {s.lower() for s in raw_skills}
    merged_skills = list(nlp_skills)
    for skill in raw_skills:
        if skill.lower() not in {s["skill_name"].lower() for s in merged_skills}:
            merged_skills.append({"skill_name": skill, "proficiency": "intermediate", "source": "linkedin"})

    supabase.table("student_profiles").update(
        {
            "linkedin_url": linkedin_url,
            "extracted_skills": merged_skills,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("user_id", current_user["id"]).execute()

    return {
        "message": "LinkedIn profile synced",
        "skills_count": len(merged_skills),
        "skills": merged_skills,
    }
