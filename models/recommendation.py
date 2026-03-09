from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class CourseType(str, Enum):
    free = "free"
    paid = "paid"
    certification = "certification"


class Course(BaseModel):
    id: Optional[str] = None
    title: str
    provider: Optional[str] = None
    url: Optional[str] = None
    skills_covered: List[str] = []
    course_type: str = "free"
    rating: float = 0.0
    duration_hours: float = 0.0


class PracticeTask(BaseModel):
    title: str
    description: str
    skill: str
    difficulty: str = "beginner"
    estimated_hours: float = 2.0


class Recommendation(BaseModel):
    id: Optional[str] = None
    user_id: str
    job_role_id: str
    missing_skills: List[str] = []
    recommended_courses: List[dict] = []
    practice_tasks: List[dict] = []
    match_score: float = 0.0
    generated_at: Optional[str] = None
