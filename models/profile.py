from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class SkillSource(str, Enum):
    resume = "resume"
    manual = "manual"
    linkedin = "linkedin"


class SkillProficiency(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class SkillEntry(BaseModel):
    skill_name: str
    proficiency: str = "intermediate"
    source: str = "manual"


class ProjectEntry(BaseModel):
    title: str
    description: Optional[str] = None
    tech_stack: List[str] = []
    url: Optional[str] = None


class ExperienceEntry(BaseModel):
    company: str
    role: str
    duration: Optional[str] = None
    description: Optional[str] = None


class EducationEntry(BaseModel):
    degree: str
    institution: str
    year: Optional[str] = None
    field_of_study: Optional[str] = None


class StudentProfile(BaseModel):
    id: Optional[str] = None
    user_id: str
    extracted_skills: List[dict] = []
    projects: List[dict] = []
    experience: List[dict] = []
    education: List[dict] = []
    linkedin_url: Optional[str] = None
    resume_url: Optional[str] = None
    resume_text: Optional[str] = None
    last_updated: Optional[str] = None


class StudentProfileUpdate(BaseModel):
    extracted_skills: Optional[List[dict]] = None
    projects: Optional[List[dict]] = None
    experience: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    linkedin_url: Optional[str] = None
