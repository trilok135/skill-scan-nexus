from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class ApplicationStatus(str, Enum):
    pending = "pending"
    shortlisted = "shortlisted"
    rejected = "rejected"


class ApplicationCreate(BaseModel):
    job_role_id: str


class Application(BaseModel):
    id: Optional[str] = None
    student_id: str
    job_role_id: str
    match_score: float = 0.0
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    status: str = "pending"
    applied_at: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
