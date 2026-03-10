"""
Auth Router — Register, Login, JWT token management.
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
"""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status

from database import get_supabase
from models.user import UserCreate, UserLogin, UserResponse, Token
from utils.auth_utils import hash_password, verify_password, create_access_token, get_current_user
from services.email_service import send_welcome_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=201)
async def register(user_in: UserCreate, background_tasks: BackgroundTasks):
    """Register a new student or HR user."""
    supabase = get_supabase()

    # Check duplicate email
    existing = supabase.table("users").select("id").eq("email", user_in.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user_in.password)
    new_user = {
        "email": user_in.email,
        "hashed_password": hashed,
        "full_name": user_in.full_name,
        "role": user_in.role.value,
        "is_verified": False,
    }

    result = supabase.table("users").insert(new_user).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="User creation failed")

    db_user = result.data[0]

    # Auto-create empty student profile
    if user_in.role.value == "student":
        supabase.table("student_profiles").insert({"user_id": db_user["id"]}).execute()

    # Send welcome email in background
    background_tasks.add_task(send_welcome_email, db_user)

    token = create_access_token({"sub": db_user["id"], "role": db_user["role"]})
    user_resp = UserResponse(
        id=db_user["id"],
        email=db_user["email"],
        full_name=db_user["full_name"],
        role=db_user["role"],
        is_verified=db_user["is_verified"],
        created_at=str(db_user.get("created_at", "")),
    )
    return Token(access_token=token, user=user_resp)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login and receive a JWT access token."""
    supabase = get_supabase()

    result = supabase.table("users").select("*").eq("email", credentials.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    db_user = result.data[0]
    if not verify_password(credentials.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": db_user["id"], "role": db_user["role"]})
    user_resp = UserResponse(
        id=db_user["id"],
        email=db_user["email"],
        full_name=db_user["full_name"],
        role=db_user["role"],
        is_verified=db_user["is_verified"],
        created_at=str(db_user.get("created_at", "")),
    )
    return Token(access_token=token, user=user_resp)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the currently authenticated user's info."""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        is_verified=current_user.get("is_verified", False),
        created_at=str(current_user.get("created_at", "")),
    )
