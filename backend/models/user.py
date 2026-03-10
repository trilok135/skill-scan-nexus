from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum
from datetime import datetime


class UserRole(str, Enum):
    student = "student"
    hr = "hr"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.student


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_verified: bool
    created_at: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: str
    role: str
