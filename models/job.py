from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class SkillImportance(str, Enum):
    must_have = "must_have"
    nice_to_have = "nice_to_have"


class SkillRequirement(BaseModel):
    skill_name: str
    importance: str = "must_have"


class JobRoleCreate(BaseModel):
    title: str
    category: Optional[str] = None
    required_skills: List[dict] = []   # [{skill_name, importance}]
    description: Optional[str] = None
    avg_salary: Optional[str] = None
    industry: Optional[str] = None


class JobRole(BaseModel):
    id: str
    title: str
    category: Optional[str] = None
    required_skills: List[dict] = []
    description: Optional[str] = None
    avg_salary: Optional[str] = None
    industry: Optional[str] = None
    created_at: Optional[str] = None
