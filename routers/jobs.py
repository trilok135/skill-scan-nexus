"""
Jobs Router — CRUD for job roles.
Public: GET (list, detail)
HR only: POST, PUT
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional

from database import get_supabase
from models.job import JobRoleCreate
from utils.auth_utils import get_current_user, get_current_hr

router = APIRouter(prefix="/api/jobs", tags=["Job Roles"])


@router.get("/")
async def list_jobs(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by title"),
):
    """List all job roles. Optionally filter by category or search title."""
    supabase = get_supabase()
    query = supabase.table("job_roles").select("*")
    result = query.execute()
    jobs = result.data or []

    if category:
        jobs = [j for j in jobs if j.get("category", "").lower() == category.lower()]
    if search:
        jobs = [j for j in jobs if search.lower() in j.get("title", "").lower()]

    return {"total": len(jobs), "jobs": jobs}


@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get details of a specific job role including required skills."""
    supabase = get_supabase()
    result = supabase.table("job_roles").select("*").eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job role not found")
    return result.data[0]


@router.post("/", status_code=201)
async def create_job(
    job_in: JobRoleCreate, current_user: dict = Depends(get_current_hr)
):
    """Create a new job role. HR only."""
    supabase = get_supabase()
    result = supabase.table("job_roles").insert(job_in.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create job role")
    return {"message": "Job role created", "job": result.data[0]}


@router.put("/{job_id}")
async def update_job(
    job_id: str,
    job_in: JobRoleCreate,
    current_user: dict = Depends(get_current_hr),
):
    """Update an existing job role. HR only."""
    supabase = get_supabase()
    result = (
        supabase.table("job_roles")
        .update(job_in.model_dump())
        .eq("id", job_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Job role not found")
    return {"message": "Job role updated", "job": result.data[0]}


@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: str, current_user: dict = Depends(get_current_hr)):
    """Delete a job role. HR only."""
    supabase = get_supabase()
    supabase.table("job_roles").delete().eq("id", job_id).execute()
    return None
